import { config } from "dotenv";
config();

import { createResource, getResources } from "./src/lib/api/resources.functions";
import { createRequest, getRequests } from "./src/lib/api/requests.functions";
import { executeMatchingCycle } from "./src/lib/api/matching.functions";
import { getLedgerHistory } from "./src/lib/api/ledger.functions";
import { recordSnapshot } from "./src/lib/api/analytics.functions";
import { getMarketplaceInsights } from "./src/lib/api/insights.functions";

async function run() {
  console.log("--- STARTING END-TO-END VALIDATION ---");
  try {
    // 1. Create Resource
    console.log("1. Creating Resource...");
    const resource = await createResource({
      data: {
        type: "ev",
        title: "Test EV Charger",
        description: "A fast charger for testing",
        location: "Downtown",
        availability: { start: new Date(), end: new Date(Date.now() + 86400000) },
        quantity: 1,
        price: 15,
        status: "listed",
      },
    });
    console.log("Resource created:", resource?._id);

    // 2. Create Request
    console.log("2. Creating Request...");
    const request = await createRequest({
      data: {
        resourceType: "ev",
        location: "Downtown",
        maxPrice: 20,
        priority: 8,
        timeWindow: { start: new Date(), end: new Date(Date.now() + 86400000) },
        status: "pending",
      },
    });
    console.log("Request created:", request?._id);

    // 3. Execute Matching
    console.log("3. Executing Matching Cycle...");
    const matchReport = await executeMatchingCycle();
    console.log("Matching Summary:", matchReport?.summary);

    // 4. Verify Ledger
    console.log("4. Fetching Ledger...");
    const ledger = await getLedgerHistory();
    console.log(`Ledger Entries: ${ledger?.length}`);

    // 5. Record Snapshot
    console.log("5. Recording Analytics Snapshot...");
    const snapshot = await recordSnapshot();
    console.log("Snapshot Recorded:", snapshot?.timestamp);

    // 6. Generate Insights
    console.log("6. Generating Insights...");
    const insights = await getMarketplaceInsights();
    console.log(`Insights Generated: ${insights?.length}`);

    console.log("--- VALIDATION SUCCESSFUL ---");
  } catch (error) {
    console.error("VALIDATION FAILED:", error);
  }
  process.exit(0);
}

run();
