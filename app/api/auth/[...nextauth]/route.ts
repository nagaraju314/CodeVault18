import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";


// Force Node runtime (bcrypt won't work on Edge)
export const runtime = "nodejs";


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


        // Make sure you’re reading the SAME collection your sign-up wrote to
        // NextAuth MongoDBAdapter also uses "users" by default.
        const user = await db.collection("users").findOne({ email });


        if (!user) {
          console.error("[Auth] No user with email:", email);
          throw new Error("Invalid email or password");
        }


        // Support multiple common field names
        const storedHash =
          (user as any).password ||
          (user as any).passwordHash ||
          (user as any).hashedPassword ||
          null;


        // If this user was created via OAuth, they likely have NO password
        if (!storedHash || typeof storedHash !== "string") {
          console.error("[Auth] User exists but has no password hash (OAuth account).");
          // Give a clearer message in dev; in prod keep generic if you prefer
          throw new Error("This account uses Google/GitHub login. Use OAuth or set a password.");
        }


        const ok = await bcrypt.compare(password, storedHash);
        if (!ok) {
          console.error("[Auth] Password compare failed for:", email);
          throw new Error("Invalid email or password");
        }


        return {
          id: user._id.toString(),
          name: user.name ?? "",
          email: user.email ?? email,
          image: user.image ?? null,
        };
      },
    }),
  ],


  // Use JWT sessions
  session: { strategy: "jwt" },


  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: (user as any).id,
          name: user.name ?? "",
          email: user.email ?? "",
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as {
          id: string;
          name: string;
          email: string;
          image?: string | null;
        };
      }
      return session;
    },
  },


  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,


  // Helpful while you debug “incorrect password”
  debug: true,
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


