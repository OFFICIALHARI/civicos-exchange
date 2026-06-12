import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

async function loadValidationService() {
  return import("@/server/services/validation.service");
}

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

function verifySecret(secret?: string) {
  const envSecret = process.env.ADMIN_SECRET || "civicos-dev-secret";
  if (secret !== envSecret) {
    throw new Error("Unauthorized: Invalid admin secret.");
  }
}

export const runScenario = createServerFn({ method: "POST" })
  .inputValidator(z.object({ 
    scenario: z.enum(["A", "B", "C"]),
    secret: z.string().optional()
  }))
  .handler(async ({ data }) => {
    try {
      verifySecret(data.secret);
      const svc = await loadValidationService();
      if (data.scenario === "A") return await svc.seedScenarioA();
      if (data.scenario === "B") return await svc.seedScenarioB();
      if (data.scenario === "C") return await svc.seedScenarioC();
    } catch (error) {
      wrapError(`run scenario ${data.scenario}`, error);
    }
  });

export const clearAllData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ secret: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      verifySecret(data.secret);
      const { clearDatabase } = await loadValidationService();
      await clearDatabase();
      return { success: true };
    } catch (error) {
      wrapError("clear database", error);
    }
  });
