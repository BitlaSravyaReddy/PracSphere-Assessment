// This file defines User schema for Backend data (MongoDB)

// importing mongoose to define schema, model for the data 
import mongoose, { Schema, Model, models } from "mongoose";

// this is an interface for User data( it contains neccessary basic fields as well as optional fields for OAuth users and avatar, email verification etc)
export interface IUser {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  isEmailVerified: boolean;
  emailVerificationOTP?: string; // Hashed OTP
  emailVerificationOTPExpiry?: Date;
  accountStatus: "pending" | "active" | "suspended";
  authProvider?: "credentials" | "google"; // Track how user signed up
  avatar?: string; // Profile picture (base64 or URL)
  createdAt?: Date;
  updatedAt?: Date;
}

// This is a constant variable that holds the schema structure from the IUser interface along with types and constraints of each field
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false }, // Not required for OAuth users
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String, required: false },
    emailVerificationOTPExpiry: { type: Date, required: false },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    avatar: { type: String, required: false },
  },
  { timestamps: true }
);

// Exporting the User model using Mongoose's model function
const User =
  (models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;