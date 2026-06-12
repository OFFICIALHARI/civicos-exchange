import { ObjectId } from "mongodb";

import * as resourceRepository from "@/server/repositories/resource.repository";
import * as requestRepository from "@/server/repositories/request.repository";
import * as bookingRepository from "@/server/repositories/booking.repository";
import * as ledgerRepository from "@/server/repositories/ledger.repository";
import * as historicalRepository from "@/server/repositories/historical-metric.repository";
import { executeMatchingCycle } from "@/server/services/match-execution.service";
import { recordMarketplaceSnapshot } from "@/server/services/historical-metric.service";
import { getCollections } from "@/server/db/collections.server";

export type ValidationScenario = "A" | "B" | "C";

export async function clearDatabase() {
  const collections = await getCollections();
  await Promise.all([
    collections.resources.deleteMany({}),
    collections.requests.deleteMany({}),
    collections.bookings.deleteMany({}),
    collections.ledger.deleteMany({}),
    collections.historicalMetrics.deleteMany({}),
  ]);
}

export async function seedScenarioA() {
  // Scenario A: Match Success (Resource + Request)
  await clearDatabase();
  
  const ownerId = new ObjectId();
  const userId = new ObjectId();
  
  const resource = await resourceRepository.create({
    ownerId,
    type: "ev",
    title: "Validation Charger",
    description: "System validation resource",
    location: "Civic Plaza",
    availability: {
      start: new Date(),
      end: new Date(Date.now() + 8 * 3600000),
    },
    quantity: 1,
    price: 5.0,
    status: "listed",
  });

  await requestRepository.create({
    userId,
    resourceType: "ev",
    location: "Civic Plaza",
    maxPrice: 10,
    priority: 5,
    timeWindow: {
      start: new Date(Date.now() + 3600000),
      end: new Date(Date.now() + 7200000),
    },
    status: "pending",
  });

  const report = await executeMatchingCycle();
  return { report };
}

export async function seedScenarioB() {
  // Scenario B: Risk Insight (High Demand / Low Supply)
  await clearDatabase();
  
  const userId = new ObjectId();
  
  // Create 5 requests for only 1 resource
  for (let i = 0; i < 5; i++) {
    await requestRepository.create({
      userId,
      resourceType: "parking",
      location: "Riverside",
      maxPrice: 10,
      priority: 9,
      timeWindow: { start: new Date(), end: new Date(Date.now() + 3600000) },
      status: "pending",
    });
  }

  await resourceRepository.create({
    ownerId: new ObjectId(),
    type: "parking",
    title: "Lone Bay",
    description: "Lone bay in Riverside",
    location: "Riverside",
    availability: { start: new Date(), end: new Date(Date.now() + 86400000) },
    quantity: 1,
    price: 2,
    status: "listed",
  });

  // Record history to build trend for insights
  for (let i = 0; i < 3; i++) {
    await recordMarketplaceSnapshot();
  }
}

export async function seedScenarioC() {
  // Scenario C: Opportunity Insight (Underutilization)
  await clearDatabase();
  
  // 10 resources listed, 0 requests
  for (let i = 0; i < 10; i++) {
    await resourceRepository.create({
      ownerId: new ObjectId(),
      type: "solar",
      title: `Solar Block ${i}`,
      description: "Validation solar block",
      location: "Sunfield",
      availability: { start: new Date(), end: new Date(Date.now() + 86400000) },
      quantity: 1,
      price: 1,
      status: "listed",
    });
  }

  await recordMarketplaceSnapshot();
}
