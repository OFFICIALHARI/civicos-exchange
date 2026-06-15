import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { RequestCreateSchema, RequestPatchSchema } from "@/server/validators/request.validator";
import { RequestResourceTypeSchema } from "@/server/models/request";
import type { RequestDocument } from "@/server/models/request";

const requestIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Request id must be a valid MongoDB ObjectId.");

export type RequestResponse = {
  _id: string;
  userId: string;
  resourceType: RequestDocument["resourceType"];
  location: string;
  maxPrice: number;
  priority: number;
  timeWindow: {
    start: string;
    end: string;
  };
  status: RequestDocument["status"];
  createdAt: string;
  updatedAt: string;
};

async function loadRequestRepository() {
  return import("@/server/repositories/request.repository");
}

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

function serializeRequest(request: RequestDocument): RequestResponse {
  return {
    _id: request._id.toHexString(),
    userId: request.userId.toHexString(),
    resourceType: request.resourceType,
    location: request.location,
    maxPrice: request.maxPrice,
    priority: request.priority,
    timeWindow: {
      start: request.timeWindow.start.toISOString(),
      end: request.timeWindow.end.toISOString(),
    },
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export const createRequest = createServerFn({ method: "POST" })
  .inputValidator(RequestCreateSchema)
  .handler(async ({ data }): Promise<RequestResponse> => {
    try {
      const { create } = await loadRequestRepository();
      return serializeRequest(await create(data));
    } catch (error) {
      wrapError("create request", error);
    }
  });

export const getRequests = createServerFn({ method: "POST" }).handler(
  async (): Promise<RequestResponse[]> => {
    try {
      const { findAll } = await loadRequestRepository();
      return (await findAll()).map(serializeRequest);
    } catch (error) {
      wrapError("fetch requests", error);
    }
  },
);

export const getRequestById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: requestIdSchema }))
  .handler(async ({ data }): Promise<RequestResponse | null> => {
    try {
      const { findById } = await loadRequestRepository();
      const request = await findById(data.id);
      return request ? serializeRequest(request) : null;
    } catch (error) {
      wrapError("fetch request", error);
    }
  });

export const updateRequest = createServerFn({ method: "POST" })
  .inputValidator(RequestPatchSchema)
  .handler(async ({ data }): Promise<RequestResponse | null> => {
    try {
      const { update } = await loadRequestRepository();
      const request = await update(data);
      return request ? serializeRequest(request) : null;
    } catch (error) {
      wrapError("update request", error);
    }
  });

export const deleteRequest = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: requestIdSchema }))
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { deleteRequest: deleteRequestRepository } = await loadRequestRepository();
      return await deleteRequestRepository(data.id);
    } catch (error) {
      wrapError("delete request", error);
    }
  });

export const getPendingRequests = createServerFn({ method: "POST" }).handler(
  async (): Promise<RequestResponse[]> => {
    try {
      const { findPending } = await loadRequestRepository();
      return (await findPending()).map(serializeRequest);
    } catch (error) {
      wrapError("fetch pending requests", error);
    }
  },
);

export const getRequestsByUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: requestIdSchema }))
  .handler(async ({ data }): Promise<RequestResponse[]> => {
    try {
      const { findByUser } = await loadRequestRepository();
      return (await findByUser(data.userId)).map(serializeRequest);
    } catch (error) {
      wrapError("fetch requests by user", error);
    }
  });
