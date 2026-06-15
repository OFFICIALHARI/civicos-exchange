import { ObjectId } from "mongodb";

import type { BookingDocument, BookingStatus } from "@/server/models/booking";
import type { LedgerEntryDocument } from "@/server/models/ledger-entry";

import * as bookingRepository from "@/server/repositories/booking.repository";
import * as ledgerRepository from "@/server/repositories/ledger.repository";
import * as requestRepository from "@/server/repositories/request.repository";
import * as resourceRepository from "@/server/repositories/resource.repository";

type LedgerStatus = BookingStatus;

type BookingReference = BookingDocument | string | ObjectId;
type ObjectIdReference = string | ObjectId;

export type LedgerEntryRecord = LedgerEntryDocument & {
  status: LedgerStatus;
};

export type LedgerServiceErrorCode =
  | "INVALID_BOOKING_ID"
  | "INVALID_RESOURCE_ID"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_NOT_COMPLETED"
  | "MISSING_REFERENCE"
  | "REPOSITORY_ERROR";

export interface LedgerServiceError {
  code: LedgerServiceErrorCode;
  message: string;
  details?: Record<string, string>;
}

export type LedgerServiceResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: LedgerServiceError;
    };

export interface LedgerBatchResult {
  createdEntries: LedgerEntryRecord[];
  failures: LedgerServiceError[];
}

function success<T>(value: T): LedgerServiceResult<T> {
  return { ok: true, value };
}

function failure(
  code: LedgerServiceErrorCode,
  message: string,
  details?: Record<string, string>,
): LedgerServiceResult<never> {
  return { ok: false, error: { code, message, details } };
}

function isBookingStatus(value: string): value is LedgerStatus {
  return value === "active" || value === "completed" || value === "cancelled";
}

function isValidObjectId(value: ObjectIdReference): boolean {
  return value instanceof ObjectId || ObjectId.isValid(value);
}

function toObjectIdString(value: ObjectIdReference): string {
  return value instanceof ObjectId ? value.toHexString() : value;
}

function resolveBookingId(input: BookingReference): LedgerServiceResult<ObjectIdReference> {
  if (input instanceof ObjectId) {
    return success(input);
  }

  if (typeof input === "string") {
    if (!isValidObjectId(input)) {
      return failure("INVALID_BOOKING_ID", "Booking id must be a valid MongoDB ObjectId.", {
        bookingId: input,
      });
    }

    return success(input);
  }

  if (!input._id || !isValidObjectId(input._id)) {
    return failure("INVALID_BOOKING_ID", "Booking id must be a valid MongoDB ObjectId.", {
      bookingId: input._id ? toObjectIdString(input._id) : "missing",
    });
  }

  return success(input._id);
}

async function loadBooking(
  reference: BookingReference,
): Promise<LedgerServiceResult<BookingDocument>> {
  const bookingIdResult = resolveBookingId(reference);
  if (!bookingIdResult.ok) {
    return bookingIdResult;
  }

  try {
    const booking = await bookingRepository.findById(bookingIdResult.value);
    if (!booking) {
      return failure("BOOKING_NOT_FOUND", "Booking was not found.", {
        bookingId: toObjectIdString(bookingIdResult.value),
      });
    }

    return success(booking);
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to load booking.",
    );
  }
}

async function loadRequiredReferences(
  booking: BookingDocument,
): Promise<LedgerServiceResult<{ booking: BookingDocument }>> {
  try {
    const [request, resource] = await Promise.all([
      requestRepository.findById(booking.requestId),
      resourceRepository.findById(booking.resourceId),
    ]);

    if (!request) {
      return failure(
        "MISSING_REFERENCE",
        "Ledger entry cannot be created because the request is missing.",
        {
          requestId: booking.requestId.toHexString(),
        },
      );
    }

    if (!resource) {
      return failure(
        "MISSING_REFERENCE",
        "Ledger entry cannot be created because the resource is missing.",
        {
          resourceId: booking.resourceId.toHexString(),
        },
      );
    }

    return success({ booking });
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to load booking references.",
    );
  }
}

function normalizeLedgerEntry(
  entry: LedgerEntryDocument,
  bookingStatus: LedgerStatus,
): LedgerEntryRecord {
  return {
    ...entry,
    status: bookingStatus,
  };
}

async function enrichLedgerEntries(
  entries: Array<LedgerEntryDocument & { status?: string }>,
): Promise<LedgerServiceResult<LedgerEntryRecord[]>> {
  const enriched: LedgerEntryRecord[] = [];

  for (const entry of entries) {
    try {
      const booking = await bookingRepository.findById(entry.bookingId);
      if (!booking) {
        return failure("MISSING_REFERENCE", "Ledger entry references a missing booking.", {
          bookingId: entry.bookingId.toHexString(),
        });
      }

      enriched.push(normalizeLedgerEntry(entry, booking.status));
    } catch (error) {
      return failure(
        "REPOSITORY_ERROR",
        error instanceof Error ? error.message : "Failed to enrich ledger entry.",
      );
    }
  }

  return success(enriched);
}

async function createLedgerRecord(
  booking: BookingDocument,
): Promise<LedgerServiceResult<LedgerEntryRecord>> {
  if (booking.status !== "completed") {
    return failure(
      "BOOKING_NOT_COMPLETED",
      "Only completed bookings can be written to the ledger.",
      {
        bookingId: booking._id.toHexString(),
        bookingStatus: booking.status,
      },
    );
  }

  const referenceCheck = await loadRequiredReferences(booking);
  if (!referenceCheck.ok) {
    return referenceCheck;
  }

  try {
    const existingEntries = (await ledgerRepository.findByBooking(booking._id)) as Array<
      LedgerEntryDocument & { status?: string }
    >;
    if (existingEntries.length > 0) {
      return success(normalizeLedgerEntry(existingEntries[0], booking.status));
    }
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to inspect existing ledger entries.",
    );
  }

  const ledgerEntry: LedgerEntryRecord = {
    _id: new ObjectId(),
    bookingId: booking._id,
    resourceId: booking.resourceId,
    requestId: booking.requestId,
    matchedPrice: booking.matchedPrice,
    score: booking.score,
    timestamp: booking.timestamp,
    status: booking.status,
  };

  try {
    await ledgerRepository.create(ledgerEntry);
    return success(ledgerEntry);
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to create ledger entry.",
    );
  }
}

export async function createLedgerEntry(
  booking: BookingReference,
): Promise<LedgerServiceResult<LedgerEntryRecord>> {
  const loadedBooking = await loadBooking(booking);
  if (!loadedBooking.ok) {
    return loadedBooking;
  }

  return createLedgerRecord(loadedBooking.value);
}

export async function createLedgerEntriesFromBookings(
  bookings: BookingReference[],
): Promise<LedgerServiceResult<LedgerBatchResult>> {
  const createdEntries: LedgerEntryRecord[] = [];
  const failures: LedgerServiceError[] = [];

  for (const booking of bookings) {
    const result = await createLedgerEntry(booking);
    if (result.ok) {
      createdEntries.push(result.value);
    } else {
      failures.push(result.error);
    }
  }

  return success({ createdEntries, failures });
}

export async function getLedgerHistory(): Promise<LedgerServiceResult<LedgerEntryRecord[]>> {
  try {
    const entries = (await ledgerRepository.findAll()) as Array<
      LedgerEntryDocument & { status?: string }
    >;
    return enrichLedgerEntries(entries);
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to load ledger history.",
    );
  }
}

export async function getLedgerByBooking(
  bookingId: ObjectIdReference,
): Promise<LedgerServiceResult<LedgerEntryRecord[]>> {
  if (!isValidObjectId(bookingId)) {
    return failure("INVALID_BOOKING_ID", "Booking id must be a valid MongoDB ObjectId.", {
      bookingId: toObjectIdString(bookingId),
    });
  }

  try {
    const entries = (await ledgerRepository.findByBooking(bookingId)) as Array<
      LedgerEntryDocument & { status?: string }
    >;
    return enrichLedgerEntries(entries);
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to load ledger entries by booking.",
    );
  }
}

export async function getLedgerByResource(
  resourceId: ObjectIdReference,
): Promise<LedgerServiceResult<LedgerEntryRecord[]>> {
  if (!isValidObjectId(resourceId)) {
    return failure("INVALID_RESOURCE_ID", "Resource id must be a valid MongoDB ObjectId.", {
      resourceId: toObjectIdString(resourceId),
    });
  }

  try {
    const entries = (await ledgerRepository.findByResource(resourceId)) as Array<
      LedgerEntryDocument & { status?: string }
    >;
    return enrichLedgerEntries(entries);
  } catch (error) {
    return failure(
      "REPOSITORY_ERROR",
      error instanceof Error ? error.message : "Failed to load ledger entries by resource.",
    );
  }
}
