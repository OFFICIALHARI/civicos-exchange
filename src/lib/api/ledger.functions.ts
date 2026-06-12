import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { LedgerEntryRecord, LedgerServiceResult } from "@/server/services/ledger.service";

async function loadLedgerService() {
  return import("@/server/services/ledger.service");
}

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Id must be a valid MongoDB ObjectId.");

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

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
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

function handleServiceResult<T, R>(result: LedgerServiceResult<T>, mapper: (val: T) => R): R {
  if (result.ok) {
    return mapper(result.value);
  }

  throw new Error(`${result.error.code}: ${result.error.message}`);
}

export const getLedgerHistory = createServerFn({ method: "POST" })
  .handler(async (): Promise<LedgerEntryResponse[]> => {
    try {
      const { getLedgerHistory: serviceFn } = await loadLedgerService();
      const result = await serviceFn();
      return handleServiceResult(result, (entries) => entries.map(serializeLedgerEntry));
    } catch (error) {
      wrapError("fetch ledger history", error);
    }
  });

export const getLedgerByBooking = createServerFn({ method: "POST" })
  .inputValidator(z.object({ bookingId: objectIdSchema }))
  .handler(async ({ data }): Promise<LedgerEntryResponse[]> => {
    try {
      const { getLedgerByBooking: serviceFn } = await loadLedgerService();
      const result = await serviceFn(data.bookingId);
      return handleServiceResult(result, (entries) => entries.map(serializeLedgerEntry));
    } catch (error) {
      wrapError("fetch ledger by booking", error);
    }
  });

export const getLedgerByResource = createServerFn({ method: "POST" })
  .inputValidator(z.object({ resourceId: objectIdSchema }))
  .handler(async ({ data }): Promise<LedgerEntryResponse[]> => {
    try {
      const { getLedgerByResource: serviceFn } = await loadLedgerService();
      const result = await serviceFn(data.resourceId);
      return handleServiceResult(result, (entries) => entries.map(serializeLedgerEntry));
    } catch (error) {
      wrapError("fetch ledger by resource", error);
    }
  });
