import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("civicos");
    const requests = database.collection("requests");
    const docs = await requests.find().limit(5).toArray();
    console.log(docs);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
