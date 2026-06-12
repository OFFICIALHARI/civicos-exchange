import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { BookingDocument } from "@/server/models/booking";
import type { LedgerEntryRecord } from "@/server/services/ledger.service";
import type {
  MatchExecutionReport,
  MatchExecutionSummary,
  ExecutionSummaryInput,
} from "@/server/services/match-execution.service";

async function loadMatchExecutionService() {
  return import("@/server/services/match-execution.service");
}

async function loadBookingRepository() {
  return import("@/server/repositories/booking.repository");
}

async function loadResourceRepository() {
  return import("@/server/repositories/resource.repository");
}

async function loadRequestRepository() {
  return import("@/server/repositories/request.repository");
}

const requestIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Request id must be a valid MongoDB ObjectId.");

export type BookingResponse = {
  _id: string;
  requestId: string;
  resourceId: string;
  matchedPrice: number;
  score: number;
  status: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntryResponse = {
  _id: string;
  bookingId: string;
  resourceId: string;
  requestId: string;
  matchedPrice: number;
  score: number;
  timestamp: string;
  status: string;
};

export type MatchResponse = {
  id: string;
  resourceTitle: string;
  requesterName: string;
  confidence: number;
  reason: string[];
  matchedPrice: number;
  status: string;
  timestamp: string;
};

export type MatchExecutionReportResponse = {
  status: MatchExecutionReport["status"];
  summary: MatchExecutionSummary;
  matches: MatchExecutionReport["matches"];
  bookings: BookingResponse[];
  ledgerEntries: LedgerEntryResponse[];
  issues: MatchExecutionReport["issues"];
};

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

function serializeBooking(booking: BookingDocument): BookingResponse {
  return {
    _id: booking._id.toHexString(),
    requestId: booking.requestId.toHexString(),
    resourceId: booking.resourceId.toHexString(),
    matchedPrice: booking.matchedPrice,
    score: booking.score,
    status: booking.status,
    timestamp: booking.timestamp.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

function serializeLedgerEntry(entry: LedgerEntryRecord): LedgerEntryResponse {
  return {
    _id: entry._id.toHexString(),
    bookingId: entry.bookingId.toHexString(),
    resourceId: entry.resourceId.toHexString(),
    requestId: entry.requestId.toHexString(),
    matchedPrice: entry.matchedPrice,
    score: entry.score,
    timestamp: entry.timestamp.toISOString(),
    status: entry.status,
  };
}

function serializeReport(report: MatchExecutionReport): MatchExecutionReportResponse {
  return {
    ...report,
    bookings: report.bookings.map(serializeBooking),
    ledgerEntries: report.ledgerEntries.map(serializeLedgerEntry),
  };
}

export const executeMatchingCycle = createServerFn({ method: "POST" })
  .handler(async (): Promise<MatchExecutionReportResponse> => {
    try {
      const { executeMatchingCycle: serviceFn } = await loadMatchExecutionService();
      return serializeReport(await serviceFn());
    } catch (error) {
      wrapError("execute matching cycle", error);
    }
  });

export const executeMatchingForRequest = createServerFn({ method: "POST" })
  .inputValidator(z.object({ requestId: requestIdSchema }))
  .handler(async ({ data }): Promise<MatchExecutionReportResponse> => {
    try {
      const { executeMatchingForRequest: serviceFn } = await loadMatchExecutionService();
      const { findById } = await loadRequestRepository();
      
      const request = await findById(data.requestId);
      if (!request) {
        throw new Error(`Request with id ${data.requestId} not found.`);
      }

      return serializeReport(await serviceFn(request));
    } catch (error) {
      wrapError("execute matching for request", error);
    }
  });

export const generateExecutionSummary = createServerFn({ method: "POST" })
  .inputValidator(z.custom<ExecutionSummaryInput>())
  .handler(async ({ data }): Promise<MatchExecutionSummary> => {
    try {
      const { generateExecutionSummary: serviceFn } = await loadMatchExecutionService();
      return serviceFn(data);
    } catch (error) {
      wrapError("generate execution summary", error);
    }
  });

export const getRecentMatches = createServerFn({ method: "POST" })
  .handler(async (): Promise<MatchResponse[]> => {
    try {
      const { findAll: findBookings } = await loadBookingRepository();
      const { findById: findResource } = await loadResourceRepository();
      const { findById: findRequest } = await loadRequestRepository();

      const bookings = await findBookings();
      
      const enrichedMatches = await Promise.all(
        bookings.slice(0, 10).map(async (b) => {
          const [resource, request] = await Promise.all([
            findResource(b.resourceId),
            findRequest(b.requestId),
          ]);

          return {
            id: b._id.toHexString().slice(-6).toUpperCase(),
            resourceTitle: resource?.title || "Unknown Resource",
            requesterName: "Requester", // User entity join not fully implemented
            confidence: b.score,
            reason: [
              "Optimized location matching",
              "Price within window",
              "Priority allocation",
            ],
            matchedPrice: b.matchedPrice,
            status: b.status === "active" ? "matched" : "confirmed",
            timestamp: b.timestamp.toISOString(),
          };
        })
      );

      return enrichedMatches;
    } catch (error) {
      wrapError("fetch recent matches", error);
    }
  });
