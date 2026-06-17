import type { AnalyticsSummary } from "@/server/services/analytics.service";
import type { HistoricalMetricDocument } from "@/server/models/historical-metric";
import type { LedgerEntryDocument } from "@/server/models/ledger-entry";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface GeminiInsightResponse {
  opportunities: any[];
  risks: any[];
  recommendations: any[];
  forecasts: any[];
  summary: string;
}

export async function generateGeminiInsights(
  summary: AnalyticsSummary,
  history: HistoricalMetricDocument[],
  ledger: LedgerEntryDocument[]
): Promise<GeminiInsightResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Falling back to deterministic insights.");
    return null;
  }

  const promptContext = `
You are an expert AI Marketplace Analyst for CivicOS, a community resource exchange platform.
Analyze the following real-time data, historical metrics, and recent ledger entries to generate actionable insights.

CURRENT MARKETPLACE STATUS:
- Total Resources: ${summary.dashboardMetrics.totalResources}
- Available: ${summary.dashboardMetrics.availableResources}
- Booked: ${summary.dashboardMetrics.bookedResources}
- Total Revenue: ₹${summary.dashboardMetrics.totalRevenue}
- Community Savings: ₹${summary.dashboardMetrics.totalCommunitySavings}
- Demand Pressure: ${summary.demandPressure.demandPressure.toFixed(2)}x
- Utilization: ${(summary.marketplaceHealth.utilization * 100).toFixed(1)}%
- Match Quality: ${(summary.marketplaceHealth.averageMatchScore * 100).toFixed(1)}%
- Overall Health: ${summary.marketplaceHealth.status}

RESOURCE BREAKDOWN:
- Parking: ${summary.resourceBreakdown.parking}
- EV Chargers: ${summary.resourceBreakdown.ev}
- Solar Shares: ${summary.resourceBreakdown.solar}
- Community Rooms: ${summary.resourceBreakdown.room}

RECENT LEDGER TRANSACTIONS (Last 5):
${ledger.slice(0, 5).map(l => `- Match Score: ${(l.score * 100).toFixed(1)}%, Price: ₹${l.matchedPrice}`).join('\n')}

HISTORICAL SNAPSHOTS (Last ${history.length} periods):
${history.map((h, i) => `[Period ${i + 1}] Util: ${(h.utilizationPercentage * 100).toFixed(1)}%, Demand: ${h.demandPressure.toFixed(2)}x`).join('\n')}

Provide your analysis in the following strict JSON format without any markdown wrappers (no \`\`\`json):
{
  "opportunities": [
    { "title": "...", "description": "...", "recommendation": "...", "severity": "low|medium|high|critical", "bullets": ["...", "..."], "confidenceScore": 85 }
  ],
  "risks": [
    { "title": "...", "description": "...", "recommendation": "...", "severity": "low|medium|high|critical", "bullets": ["...", "..."], "confidenceScore": 90 }
  ],
  "forecasts": [
    { "title": "...", "description": "...", "recommendation": "...", "severity": "low|medium|high|critical", "bullets": ["...", "..."], "confidenceScore": 80 }
  ],
  "recommendations": [
    { "title": "...", "description": "...", "recommendation": "...", "severity": "low|medium|high|critical", "bullets": ["...", "..."], "confidenceScore": 75 }
  ],
  "summary": "A 2-sentence executive summary of the marketplace health and next steps."
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptContext }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      console.error(`Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return null;
    }

    return JSON.parse(text) as GeminiInsightResponse;
  } catch (error) {
    console.error("Gemini API Request failed:", error);
    return null;
  }
}

