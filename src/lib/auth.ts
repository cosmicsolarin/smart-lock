import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        // Find user by email and also select password field
        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        // If no user is found, throw error
        if (!user) throw new Error("Wrong Email");

        // Compare the provided password with stored password
        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        // If password doesn't match, throw error
        if (!passwordMatch) throw new Error("Wrong Password");

        // Return the user object with the id and other fields
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWT-based session handling
  },
  callbacks: {
    // Add the user ID to the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Attach the user ID to the JWT token
      }
      return token;
    },
    // Attach user ID to the session
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id; // Attach the user ID to the session
      }
      return session;
    },
  },
};
