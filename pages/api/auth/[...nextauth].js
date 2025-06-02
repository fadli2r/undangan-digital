import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "../../../utils/db";
import User from "../../../models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await dbConnect();
          
          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });
          
          // If not, create new user
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              paket: "free",
              quota: 1,
              status_pembayaran: "pending"
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return true; // Still allow sign in even if DB operation fails
        }
      }
      return true;
    },
    async session({ session }) {
      try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          session.user.paket = user.paket;
          session.user.quota = user.quota;
          session.user.status_pembayaran = user.status_pembayaran;
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
