import type { BookingDocument } from "@/server/models/booking";
import type { RequestDocument } from "@/server/models/request";
import type { MatchResult } from "@/server/services/matching.service";

import { completeBooking, createBookingFromMatch } from "@/server/services/booking.service";
import {
  createLedgerEntriesFromBookings,
  type LedgerEntryRecord,
} from "@/server/services/ledger.service";
import { findBestMatchForRequest, findBestMatches } from "@/server/services/matching.service";
import { recordMarketplaceSnapshot } from "@/server/services/historical-metric.service";

export type MatchExecutionStage = "matching" | "booking" | "ledger";

export type MatchExecutionIssueCode =
  | "NO_RESOURCES_AVAILABLE"
  | "NO_REQUESTS_AVAILABLE"
  | "NO_MATCHES_FOUND"
  | "BOOKING_FAILED"
  | "LEDGER_FAILED"
  | "EXECUTION_FAILED";

export interface MatchExecutionIssue {
  stage: MatchExecutionStage;
  code: MatchExecutionIssueCode;
  message: string;
  details?: Record<string, string>;
}

export interface MatchExecutionSummary {
  totalResourcesEvaluated: number;
  totalRequestsEvaluated: number;
  totalMatchesFound: number;
  totalBookingsCreated: number;
  totalLedgerEntriesCreated: number;
  averageMatchScore: number;
}

export interface MatchExecutionReport {
  status: "completed" | "partial" | "empty" | "failed";
  summary: MatchExecutionSummary;
  matches: MatchResult[];
  bookings: BookingDocument[];
  ledgerEntries: LedgerEntryRecord[];
  issues: MatchExecutionIssue[];
}

export interface ExecutionSummaryInput {
  totalResourcesEvaluated?: number;
  totalRequestsEvaluated?: number;
  matches: MatchResult[];
  totalBookingsCreated: number;
  totalLedgerEntriesCreated: number;
}

function createIssue(
  stage: MatchExecutionStage,
  code: MatchExecutionIssueCode,
  message: string,
  details?: Record<string, string>,
): MatchExecutionIssue {
  return { stage, code, message, details };
}

function createEmptySummary(): MatchExecutionSummary {
  return {
    totalResourcesEvaluated: 0,
    totalRequestsEvaluated: 0,
    totalMatchesFound: 0,
    totalBookingsCreated: 0,
    totalLedgerEntriesCreated: 0,
    averageMatchScore: 0,
  };
}

export function generateExecutionSummary(input: ExecutionSummaryInput): MatchExecutionSummary {
  const totalMatchesFound = input.matches.length;
  const averageMatchScore =
    totalMatchesFound === 0
      ? 0
      : input.matches.reduce((sum, match) => sum + match.score, 0) / totalMatchesFound;

  return {
    totalResourcesEvaluated: input.totalResourcesEvaluated ?? totalMatchesFound,
    totalRequestsEvaluated: input.totalRequestsEvaluated ?? totalMatchesFound,
    totalMatchesFound,
    totalBookingsCreated: input.totalBookingsCreated,
    totalLedgerEntriesCreated: input.totalLedgerEntriesCreated,
    averageMatchScore,
  };
}

function buildReport(
  status: MatchExecutionReport["status"],
  summary: MatchExecutionSummary,
  matches: MatchResult[],
  bookings: BookingDocument[],
  ledgerEntries: LedgerEntryRecord[],
  issues: MatchExecutionIssue[],
): MatchExecutionReport {
  return {
    status,
    summary,
    matches,
    bookings,
    ledgerEntries,
    issues,
  };
}

async function executeMatch(match: MatchResult): Promise<{
  match: MatchResult;
  bookings: BookingDocument[];
  ledgerEntries: LedgerEntryRecord[];
  issues: MatchExecutionIssue[];
}> {
  const issues: MatchExecutionIssue[] = [];

  const bookingResult = await createBookingFromMatch(match);
  if (!bookingResult) {
    issues.push(
      createIssue("booking", "BOOKING_FAILED", "Unable to create booking from match.", {
        requestId: match.requestId,
        resourceId: match.resourceId,
      }),
    );
    return { match, bookings: [], ledgerEntries: [], issues };
  }

  const completedBooking = await completeBooking(bookingResult._id);
  if (!completedBooking) {
    issues.push(
      createIssue("booking", "BOOKING_FAILED", "Unable to complete booking after creation.", {
        bookingId: bookingResult._id.toHexString(),
      }),
    );
    return { match, bookings: [bookingResult], ledgerEntries: [], issues };
  }

  const ledgerResult = await createLedgerEntriesFromBookings([completedBooking]);
  if (!ledgerResult.ok) {
    issues.push(
      createIssue(
        "ledger",
        "LEDGER_FAILED",
        ledgerResult.error.message,
        ledgerResult.error.details,
      ),
    );
    return { match, bookings: [completedBooking], ledgerEntries: [], issues };
  }

  if (ledgerResult.value.failures.length > 0) {
    for (const failure of ledgerResult.value.failures) {
      issues.push(createIssue("ledger", "LEDGER_FAILED", failure.message, failure.details));
    }
  }

  return {
    match,
    bookings: [completedBooking],
    ledgerEntries: ledgerResult.value.createdEntries,
    issues,
  };
}

export async function executeMatchingCycle(): Promise<MatchExecutionReport> {
  try {
    const matches = await findBestMatches();

    if (matches.length === 0) {
      return buildReport(
        "empty",
        createEmptySummary(),
        [],
        [],
        [],
        [
          createIssue(
            "matching",
            "NO_MATCHES_FOUND",
            "No matches were found for the current cycle.",
          ),
        ],
      );
    }

    const bookings: BookingDocument[] = [];
    const ledgerEntries: LedgerEntryRecord[] = [];
    const issues: MatchExecutionIssue[] = [];

    for (const match of matches) {
      const execution = await executeMatch(match);
      bookings.push(...execution.bookings);
      ledgerEntries.push(...execution.ledgerEntries);
      issues.push(...execution.issues);
    }

    const summary = generateExecutionSummary({
      totalResourcesEvaluated: matches.length,
      totalRequestsEvaluated: matches.length,
      matches,
      totalBookingsCreated: bookings.length,
      totalLedgerEntriesCreated: ledgerEntries.length,
    });

    const status: MatchExecutionReport["status"] =
      issues.length === 0
        ? "completed"
        : bookings.length > 0 || ledgerEntries.length > 0
          ? "partial"
          : "failed";

    // Record a snapshot of the marketplace state after the cycle
    if (status !== "failed") {
      void recordMarketplaceSnapshot().catch((error) => {
        console.error("Failed to record marketplace snapshot:", error);
      });
    }

    return buildReport(status, summary, matches, bookings, ledgerEntries, issues);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Matching execution failed.";
    return buildReport(
      "failed",
      createEmptySummary(),
      [],
      [],
      [],
      [createIssue("matching", "EXECUTION_FAILED", message)],
    );
  }
}

export async function executeMatchingForRequest(
  request: RequestDocument,
): Promise<MatchExecutionReport> {
  try {
    const match = await findBestMatchForRequest(request);

    if (!match) {
      return buildReport(
        "empty",
        generateExecutionSummary({
          totalResourcesEvaluated: 0,
          totalRequestsEvaluated: 1,
          matches: [],
          totalBookingsCreated: 0,
          totalLedgerEntriesCreated: 0,
        }),
        [],
        [],
        [],
        [
          createIssue(
            "matching",
            "NO_MATCHES_FOUND",
            "No match was found for the provided request.",
            { requestId: request._id.toHexString() },
          ),
        ],
      );
    }

    const execution = await executeMatch(match);
    const summary = generateExecutionSummary({
      totalResourcesEvaluated: 1,
      totalRequestsEvaluated: 1,
      matches: [match],
      totalBookingsCreated: execution.bookings.length,
      totalLedgerEntriesCreated: execution.ledgerEntries.length,
    });

    const issues = execution.issues.length > 0 ? execution.issues : [];
    const status: MatchExecutionReport["status"] = issues.length === 0 ? "completed" : "partial";

    return buildReport(
      status,
      summary,
      [match],
      execution.bookings,
      execution.ledgerEntries,
      issues,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request execution failed.";
    return buildReport(
      "failed",
      createEmptySummary(),
      [],
      [],
      [],
      [
        createIssue("matching", "EXECUTION_FAILED", message, {
          requestId: request._id.toHexString(),
        }),
      ],
    );
  }
}
