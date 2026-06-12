import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ResourceCreateSchema, ResourcePatchSchema } from "@/server/validators/resource.validator";
import { ResourceTypeSchema } from "@/server/models/resource";
import type { ResourceDocument } from "@/server/models/resource";

const resourceIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Resource id must be a valid MongoDB ObjectId.");

export type ResourceResponse = {
  _id: string;
  ownerId: string;
  type: ResourceDocument["type"];
  title: string;
  description: string;
  location: string;
  availability: {
    start: string;
    end: string;
  };
  quantity: number;
  price: number;
  status: ResourceDocument["status"];
  createdAt: string;
  updatedAt: string;
};

async function loadResourceRepository() {
  return import("@/server/repositories/resource.repository");
}

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

function serializeResource(resource: ResourceDocument): ResourceResponse {
  return {
    _id: resource._id.toHexString(),
    ownerId: resource.ownerId.toHexString(),
    type: resource.type,
    title: resource.title,
    description: resource.description,
    location: resource.location,
    availability: {
      start: resource.availability.start.toISOString(),
      end: resource.availability.end.toISOString(),
    },
    quantity: resource.quantity,
    price: resource.price,
    status: resource.status,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

export const createResource = createServerFn({ method: "POST" })
  .inputValidator(ResourceCreateSchema)
  .handler(async ({ data }): Promise<ResourceResponse> => {
    try {
      const { create } = await loadResourceRepository();
      return serializeResource(await create(data));
    } catch (error) {
      wrapError("create resource", error);
    }
  });

export const getResources = createServerFn({ method: "POST" })
  .handler(async (): Promise<ResourceResponse[]> => {
    try {
      const { findAll } = await loadResourceRepository();
      return (await findAll()).map(serializeResource);
    } catch (error) {
      wrapError("fetch resources", error);
    }
  });

export const getResourceById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: resourceIdSchema }))
  .handler(async ({ data }): Promise<ResourceResponse | null> => {
    try {
      const { findById } = await loadResourceRepository();
      const resource = await findById(data.id);
      return resource ? serializeResource(resource) : null;
    } catch (error) {
      wrapError("fetch resource", error);
    }
  });

export const updateResource = createServerFn({ method: "POST" })
  .inputValidator(ResourcePatchSchema)
  .handler(async ({ data }): Promise<ResourceResponse | null> => {
    try {
      const { update } = await loadResourceRepository();
      const resource = await update(data);
      return resource ? serializeResource(resource) : null;
    } catch (error) {
      wrapError("update resource", error);
    }
  });

export const deleteResource = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: resourceIdSchema }))
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { deleteResource: deleteResourceRepository } = await loadResourceRepository();
      return await deleteResourceRepository(data.id);
    } catch (error) {
      wrapError("delete resource", error);
    }
  });

export const getResourcesByType = createServerFn({ method: "POST" })
  .inputValidator(z.object({ type: ResourceTypeSchema }))
  .handler(async ({ data }): Promise<ResourceResponse[]> => {
    try {
      const { findByType } = await loadResourceRepository();
      return (await findByType(data.type)).map(serializeResource);
    } catch (error) {
      wrapError("fetch resources by type", error);
    }
  });

export const getResourcesByOwner = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ownerId: resourceIdSchema }))
  .handler(async ({ data }): Promise<ResourceResponse[]> => {
    try {
      const { findByOwner } = await loadResourceRepository();
      return (await findByOwner(data.ownerId)).map(serializeResource);
    } catch (error) {
      wrapError("fetch resources by owner", error);
    }
  });

export const getAvailableResources = createServerFn({ method: "POST" })
  .handler(async (): Promise<ResourceResponse[]> => {
    try {
      const { findAvailable } = await loadResourceRepository();
      return (await findAvailable()).map(serializeResource);
    } catch (error) {
      wrapError("fetch available resources", error);
    }
  });