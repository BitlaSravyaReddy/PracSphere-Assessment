// this code sets up NextAuth authentication routes for handling GET and POST requests in a Next.js application
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
