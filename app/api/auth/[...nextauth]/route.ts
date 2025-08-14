import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

// Force Node runtime (bcrypt won't work on Edge)
export const runtime = "nodejs";

// Extend JWT type to hold our custom user object
interface CustomJWT extends JWT {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Extend AdapterUser for our MongoDB stored password fields
interface MongoUser extends AdapterUser {
  password?: string;
  passwordHash?: string;
  hashedPassword?: string;
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

        const user = (await db
          .collection<MongoUser>("users")
          .findOne({ email })) as MongoUser | null;

        if (!user) {
          console.error("[Auth] No user with email:", email);
          throw new Error("Invalid email or password");
        }

        const storedHash =
          user.password || user.passwordHash || user.hashedPassword || null;

        if (!storedHash || typeof storedHash !== "string") {
          console.error(
            "[Auth] User exists but has no password hash (OAuth account)."
          );
          throw new Error(
            "This account uses Google/GitHub login. Use OAuth or set a password."
          );
        }

        const ok = await bcrypt.compare(password, storedHash);
        if (!ok) {
          console.error("[Auth] Password compare failed for:", email);
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email ?? email,
          image: user.image ?? null,
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
      if (t.user) {
        session.user = t.user;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
