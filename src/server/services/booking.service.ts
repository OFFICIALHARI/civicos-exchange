import { ObjectId } from "mongodb";

import type { BookingDocument, BookingStatus } from "@/server/models/booking";
import type { LedgerEntryDocument } from "@/server/models/ledger-entry";
import type { RequestDocument, RequestStatus } from "@/server/models/request";
import type { ResourceDocument, ResourceStatus } from "@/server/models/resource";
import type { MatchResult } from "@/server/services/matching.service";

import * as bookingRepository from "@/server/repositories/booking.repository";
import * as ledgerRepository from "@/server/repositories/ledger.repository";
import * as requestRepository from "@/server/repositories/request.repository";
import * as resourceRepository from "@/server/repositories/resource.repository";

type BookingLifecycleStatus = Extract<BookingStatus, "active" | "completed" | "cancelled">;

interface BookingLifecycleContext {
  booking: BookingDocument;
  request: RequestDocument;
  resource: ResourceDocument;
}

function assertFound<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`${label} not found.`);
  }

  return value;
}

function assertStatus<T extends string>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label} must be ${expected}.`);
  }
}

function buildLedgerEntry(booking: BookingDocument): LedgerEntryDocument {
  return {
    _id: new ObjectId(),
    resourceId: booking.resourceId,
    requestId: booking.requestId,
    bookingId: booking._id,
    matchedPrice: booking.matchedPrice,
    score: booking.score,
    timestamp: booking.timestamp,
  };
}

async function createLifecycleBooking(match: MatchResult, status: BookingLifecycleStatus): Promise<BookingLifecycleContext> {
  const [request, resource] = await Promise.all([
    requestRepository.findById(match.requestId),
    resourceRepository.findById(match.resourceId),
  ]);

  const matchedRequest = assertFound(request, "Request");
  const matchedResource = assertFound(resource, "Resource");

  assertStatus(matchedRequest.status, "pending", "Request status");
  assertStatus(matchedResource.status, "listed", "Resource status");

  const booking = await bookingRepository.create({
    resourceId: matchedResource._id,
    requestId: matchedRequest._id,
    matchedPrice: match.matchedPrice,
    score: match.score,
    status,
    timestamp: new Date(),
  });

  await ledgerRepository.create(buildLedgerEntry(booking));

  return {
    booking,
    request: matchedRequest,
    resource: matchedResource,
  };
}

async function updateBookingLifecycle(bookingId: string | ObjectId, status: BookingLifecycleStatus): Promise<BookingDocument | null> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    return null;
  }

  return bookingRepository.update({
    _id: booking._id,
    matchedPrice: booking.matchedPrice,
    score: booking.score,
    status,
    requestId: booking.requestId,
    resourceId: booking.resourceId,
    timestamp: booking.timestamp,
  });
}

async function applyRequestAndResourceState(context: BookingLifecycleContext, nextStatus: BookingLifecycleStatus): Promise<void> {
  if (nextStatus === "cancelled") {
    await Promise.all([
      requestRepository.update({ _id: context.request._id, status: "pending" satisfies RequestStatus }),
      resourceRepository.update({ _id: context.resource._id, status: "listed" satisfies ResourceStatus }),
    ]);
    return;
  }

  if (nextStatus === "completed") {
    await Promise.all([
      requestRepository.update({ _id: context.request._id, status: "completed" satisfies RequestStatus }),
      resourceRepository.update({ _id: context.resource._id, status: "booked" satisfies ResourceStatus }),
    ]);
    return;
  }

  await Promise.all([
    requestRepository.update({ _id: context.request._id, status: "matched" satisfies RequestStatus }),
    resourceRepository.update({ _id: context.resource._id, status: "reserved" satisfies ResourceStatus }),
  ]);
}

export async function createBookingFromMatch(match: MatchResult): Promise<BookingDocument> {
  const context = await createLifecycleBooking(match, "active");
  await applyRequestAndResourceState(context, "active");
  return context.booking;
}

export async function findBookingById(bookingId: string | ObjectId): Promise<BookingDocument | null> {
  return bookingRepository.findById(bookingId);
}

export async function findBookings(): Promise<BookingDocument[]> {
  return bookingRepository.findAll();
}

export async function findActiveBookings(): Promise<BookingDocument[]> {
  return bookingRepository.findActive();
}

export async function findCompletedBookings(): Promise<BookingDocument[]> {
  return bookingRepository.findCompleted();
}

export async function completeBooking(bookingId: string | ObjectId): Promise<BookingDocument | null> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    return null;
  }

  const [request, resource] = await Promise.all([
    requestRepository.findById(booking.requestId),
    resourceRepository.findById(booking.resourceId),
  ]);

  const matchedRequest = assertFound(request, "Request");
  const matchedResource = assertFound(resource, "Resource");

  const updatedBooking = await updateBookingLifecycle(booking._id, "completed");
  if (!updatedBooking) {
    return null;
  }

  await applyRequestAndResourceState(
    {
      booking: updatedBooking,
      request: matchedRequest,
      resource: matchedResource,
    },
    "completed",
  );

  return updatedBooking;
}

export async function cancelBooking(bookingId: string | ObjectId): Promise<BookingDocument | null> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    return null;
  }

  const [request, resource] = await Promise.all([
    requestRepository.findById(booking.requestId),
    resourceRepository.findById(booking.resourceId),
  ]);

  const matchedRequest = assertFound(request, "Request");
  const matchedResource = assertFound(resource, "Resource");

  const updatedBooking = await updateBookingLifecycle(booking._id, "cancelled");
  if (!updatedBooking) {
    return null;
  }

  await applyRequestAndResourceState(
    {
      booking: updatedBooking,
      request: matchedRequest,
      resource: matchedResource,
    },
    "cancelled",
  );

  return updatedBooking;
}