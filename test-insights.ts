import { generateMarketplaceInsights } from "./src/server/services/insight-generation.service";

async function run() {
  try {
    const insights = await generateMarketplaceInsights();
    console.log("Insights generated:", insights);
  } catch (err) {
    console.error(err);
  }
}

run();