import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

import { getServerConfig } from "@/lib/config.server";

type MongoGlobalCache = typeof globalThis & {
  __civicosMongoClientPromise__?: Promise<MongoClient>;
  __civicosMongoClient__?: MongoClient;
};

const globalCache = globalThis as MongoGlobalCache;

const mongoClientOptions: MongoClientOptions = {
  appName: "CivicOS",
  connectTimeoutMS: 5_000,
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5_000,
};

function createMongoClient() {
  const { mongodbUri, nodeEnv } = getServerConfig();

  return new MongoClient(mongodbUri, {
    ...mongoClientOptions,
    appName: nodeEnv ? `CivicOS-${nodeEnv}` : mongoClientOptions.appName,
  });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalCache.__civicosMongoClient__) {
    return globalCache.__civicosMongoClient__;
  }

  if (!globalCache.__civicosMongoClientPromise__) {
    const client = createMongoClient();

    globalCache.__civicosMongoClientPromise__ = client.connect().then((connectedClient) => {
      globalCache.__civicosMongoClient__ = connectedClient;
      return connectedClient;
    });
  }

  return globalCache.__civicosMongoClientPromise__;
}

export async function getDatabase(): Promise<Db> {
  const { databaseName } = getServerConfig();
  const client = await getMongoClient();

  return client.db(databaseName);
}