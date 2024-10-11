import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/User";

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.NEXTAUTH_SECRET ||
  !process.env.MONGODB_URI
) {
  throw new Error("Missing environment variables for authentication");
}

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider === "google") {
        const { name, email, image } = user;
        try {
          await dbConnect();
          const dbUser = await User.findOneAndUpdate(
            { email },
            {
              $set: {
                name,
                image,
                googleId: account.providerAccountId,
                lastLogin: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );

          user.id = dbUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub as string;
          try {
            await dbConnect();
            const dbUser = await User.findById(token.sub).select(
              "createdAt lastLogin"
            );
            if (dbUser) {
              session.user.createdAt = dbUser.createdAt.toISOString();
              session.user.lastLogin = dbUser.lastLogin.toISOString();
            }
          } catch (error) {
            console.error("Error fetching user session data:", error);
          }
        } else {
          console.warn("Token sub is undefined");
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
