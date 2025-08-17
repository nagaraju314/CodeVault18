// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;


if (!uri) {
  console.warn("⚠️ MONGODB_URI is not set. Did you configure it in Vercel?");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri || "");
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri || "");
  clientPromise = client.connect();
}

export default clientPromise;
