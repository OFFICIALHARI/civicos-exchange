import { MongoClient, type Db, type MongoClientOptions } from "mongodb";
import { getServerConfig } from "@/lib/config.server";

type MongoGlobalCache = typeof globalThis & {
  __civicosMongoClientPromise__?: Promise<MongoClient>;
};

const globalCache = globalThis as MongoGlobalCache;

const mongoClientOptions: MongoClientOptions = {
  appName: "CivicOS",
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 0,
};

function createMongoClient() {
  const { mongodbUri, nodeEnv } = getServerConfig();
  const appName = nodeEnv ? `CivicOS-${nodeEnv}` : mongoClientOptions.appName;

  return new MongoClient(mongodbUri, {
    ...mongoClientOptions,
    appName,
  });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalCache.__civicosMongoClientPromise__) {
    const client = createMongoClient();

    globalCache.__civicosMongoClientPromise__ = client
      .connect()
      .then((connectedClient) => {
        return connectedClient;
      })
      .catch((error) => {
        globalCache.__civicosMongoClientPromise__ = undefined;
        console.error(error);
        throw error;
      });
  }

  const result = await globalCache.__civicosMongoClientPromise__;

  return result;
}

export async function getDatabase(): Promise<Db> {
  const { databaseName } = getServerConfig();
  const client = await getMongoClient();

  const db = client.db(databaseName);

  return db;
}
