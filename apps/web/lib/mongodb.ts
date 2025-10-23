// This file is responsible for establishing a connection endpoint to the MongoDB database using Mongoose
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(MONGODB_URI);
};
