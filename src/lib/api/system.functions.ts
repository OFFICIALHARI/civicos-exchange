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
  .inputValidator(
    z.object({
      scenario: z.enum(["A", "B", "C"]),
      secret: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      verifySecret(data.secret);
      const svc = await loadValidationService();
      if (data.scenario === "A") {
        const result = await svc.seedScenarioA();
        // Basic serialization for the report if needed,
        // but for now we'll just return a success message or simplified object
        return { success: true, scenario: "A", matchCount: result.report.matches.length };
      }
      if (data.scenario === "B") {
        await svc.seedScenarioB();
        return { success: true, scenario: "B" };
      }
      if (data.scenario === "C") {
        await svc.seedScenarioC();
        return { success: true, scenario: "C" };
      }
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
