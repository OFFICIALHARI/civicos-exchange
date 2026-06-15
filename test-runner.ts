import { config } from "dotenv";
config();

import { seedScenarioA, seedScenarioB, seedScenarioC } from "@/server/services/validation.service";

async function run() {
  console.log("--- STARTING SCENARIO A: MATCH SUCCESS ---");
  try {
    const { report } = await seedScenarioA();
    console.log("Report Status:", report.status);
    console.log("Total Matches:", report.summary.totalMatchesFound);
    console.log("Total Bookings:", report.bookings.length);
    console.log("Total Ledger Entries:", report.ledgerEntries.length);
    console.log("Issues:", report.issues);

    if (
      (report.status === "success" || report.status === "completed") &&
      report.bookings.length > 0
    ) {
      console.log("-> SCENARIO A PASS");
    } else {
      console.log("-> SCENARIO A FAIL (Incorrect status or no bookings created)");
    }
  } catch (error) {
    console.error("-> SCENARIO A ERROR:", error);
  }

  process.exit(0);
}

run();
