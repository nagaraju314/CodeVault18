import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import type { WithId, Document } from "mongodb";

export const runtime = "nodejs";

interface CustomUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface CustomJWT extends JWT {
  user?: CustomUser;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        const client = await clientPromise;
        const db = client.db();

        const userDoc = await db.collection<WithId<Document>>("users").findOne({ email });

        if (!userDoc) throw new Error("Invalid email or password");

        const storedHash =
          (userDoc.password as string | undefined) ||
          (userDoc.passwordHash as string | undefined) ||
          (userDoc.hashedPassword as string | undefined) ||
          null;

        if (!storedHash) {
          throw new Error(
            "This account uses Google/GitHub login. Use OAuth or set a password."
          );
        }

        const ok = await bcrypt.compare(password, storedHash);
        if (!ok) throw new Error("Invalid email or password");

        return {
          id: String(userDoc._id),
          name: (userDoc.name as string) ?? "",
          email: (userDoc.email as string) ?? email,
          image: (userDoc.image as string | null) ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      const t = token as CustomJWT;
      if (user) {
        t.user = {
          id: (user as AdapterUser).id,
          name: user.name ?? "",
          email: user.email ?? "",
          image: user.image ?? null,
        };
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as CustomJWT;
      if (t.user) session.user = t.user;
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
