// This file is responsible for creating and exporting a MongoDB client instance using the official MongoDB Node.js driver
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
let client = new MongoClient(uri);
let clientPromise = client.connect();

export default clientPromise;
