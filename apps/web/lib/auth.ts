// This files contains NextAuth configuration for authentication using Credentials and Google OAuth 
/**
 * 
 * - If someone uses Google, it checks if they already have an account. If not, it makes one for them and marks their email as “verified.”
  - If someone uses email and password, it checks if their email is real, if their account is not blocked, and if their password is correct.
  - It also makes sure only people who have verified their email can log in.
  - When someone logs in, it remembers who they are and can show their profile picture.
  - If anything goes wrong, it shows helpful error messages.
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "./mongodb";
import User from "../models/user";
import { generateOTP, hashOTP, getOTPExpiry } from "./otp";
import { sendOTPEmail } from "./email";

// This is the main function that sets up the authentication methods and rules for how users can log in
export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode for detailed logs
  providers: [
    // Allow users to log in with Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Allow users to log in with email and password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This function checks if the email and password are correct
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required.");
        }
        if (!/^\S+@\S+\.\S+$/.test(credentials.email)) {
          throw new Error("Invalid email format.");
        }
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email.");
        }
        
        // Check if email is verified if not verifies throws an error.
        if (!user.isEmailVerified) {
          throw new Error("Please verify your email before logging in. Check your inbox for the verification code.");
        }

        // Check account status and block users whose account is suspended. 
        if (user.accountStatus === 'suspended') {
          throw new Error("Your account has been suspended. Please contact support.");
        }
        
        // Check if user has a password field
        if (!user.password) {
          throw new Error("User password is missing.");
        }
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Incorrect password.");
        }
        // If everything is okay, let the user log in
        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    // This runs when someone tries to sign in
    async signIn({ user, account, profile }) {
      console.log("=== SignIn Callback Started ===");
      console.log("Provider:", account?.provider);
      console.log("User:", user);
      console.log("Account:", account);
      // If logging in with Google
      if (account?.provider === "google") {
        try {
          console.log("Processing Google OAuth sign-in...");
          await connectDB();
          console.log("MongoDB connected");
          
          const existingUser = await User.findOne({ email: user.email });
          console.log("Existing user found:", !!existingUser);
          // If this is a new Google user, create their account and mark as verified
           
          if (!existingUser) {
            // Create new user for Google sign-in
            console.log("Creating new Google user:", user.email);
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              authProvider: 'google',
              isEmailVerified: true, //Auto-verify Google users
              accountStatus: 'active', //  Set as active immediately
            });

            console.log("New Google user created successfully:", newUser.email);
            console.log("=== SignIn Callback Returning TRUE ===");
            return true; //  Allow sign-in
          } else {
            // Existing user - update to verified and active if needed
            if (!existingUser.isEmailVerified) {
              console.log("Updating existing Google user to verified:", user.email);
              existingUser.isEmailVerified = true;
              existingUser.accountStatus = 'active';
              await existingUser.save();
            }
            
            console.log("Existing Google user signing in:", user.email);
            console.log("=== SignIn Callback Returning TRUE ===");
            return true; //  Allow sign-in
          }
        } catch (error) {
          console.error("=== ERROR in Google sign-in callback ===");
          console.error("Error details:", error);
          console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
          console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
          console.log("=== SignIn Callback Returning FALSE ===");
          return false;
        }
      }
      console.log("=== SignIn Callback Returning TRUE (default) ===");
      return true;
    },
    // This runs when making the user's session (like a memory of who is logged in)
    async session({ session, token, trigger, newSession }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        
        // If the session is being updated manually, use the new session data
        if (trigger === "update" && newSession?.name) {
          session.user.name = newSession.name;
        }
        
        // Fetch fresh user data to include avatar and latest profile info
        try {
          await connectDB();
          const user = await User.findOne({ email: session.user.email });
          if (user) {
            console.log("Session callback - User found:", user.email);
            console.log("Session callback - Avatar exists:", !!user.avatar);
            console.log("Session callback - Avatar length:", user.avatar?.length || 0);
            
            // Update session with latest user data
            session.user.name = user.name;
            (session.user as any).avatar = user.avatar;
            (session.user as any).isEmailVerified = user.isEmailVerified;
          } else {
            console.log("Session callback - User NOT found for email:", session.user.email);
          }
        } catch (error) {
          // If there's an error, just skip updating extra info
          console.error("Error fetching user in session:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Use your custom login page
  },
  session: {
    strategy: "jwt", // Use JWT tokens to remember users
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret key for security
};