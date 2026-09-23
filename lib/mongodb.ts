import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClient = client;
  globalWithMongo._mongoClientPromise = client.connect();
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = globalWithMongo._mongoClient!;
  clientPromise = globalWithMongo._mongoClientPromise;
}

clientPromise.catch((err) => {
  console.error("MongoDB connection error:", err);
  globalWithMongo._mongoClientPromise = undefined;
});

export default clientPromise;
