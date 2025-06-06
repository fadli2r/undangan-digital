import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import Admin from "../../../models/Admin";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          const admin = await Admin.findOne({ email: credentials.email });
          
          if (admin && await admin.comparePassword(credentials.password)) {
            return {
              id: admin._id,
              email: admin.email,
              name: admin.name,
              isAdmin: true,
              role: admin.role
            };
          }
          return null;
        } catch (error) {
          console.error('Error in admin authorization:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Set a timeout for database operations
          const dbOperation = async () => {
            await dbConnect();
            
            // Check if user exists
            let dbUser = await User.findOne({ email: user.email });
            
            // If not, create new user with free status
            if (!dbUser) {
              dbUser = await User.create({
                email: user.email,
                name: user.name,
                paket: "free",
                quota: 1,
                status_pembayaran: "free"
              });
              console.log("New user created:", user.email);
            } else {
              console.log("Existing user found:", user.email);
            }
          };

          // Execute with timeout
          await Promise.race([
            dbOperation(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 5000)
            )
          ]);
          
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          // Still allow sign in even if DB operation fails
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Use token data instead of making DB queries every time
      if (token.isAdmin) {
        session.user.isAdmin = true;
        session.user.role = token.role;
      } else {
        session.user.paket = token.paket || "free";
        session.user.quota = token.quota || 0;
        session.user.status_pembayaran = token.status_pembayaran || "free";
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user?.isAdmin) {
        token.isAdmin = true;
        token.role = user.role;
      } else if (user && !token.isAdmin) {
        // Store user data in token on first login with timeout
        try {
          const fetchUserData = async () => {
            await dbConnect();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.paket = dbUser.paket;
              token.quota = dbUser.quota;
              token.status_pembayaran = dbUser.status_pembayaran;
            } else {
              // Set defaults if user not found
              token.paket = "free";
              token.quota = 1;
              token.status_pembayaran = "free";
            }
          };

          await Promise.race([
            fetchUserData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('JWT timeout')), 3000)
            )
          ]);
        } catch (error) {
          console.error("Error fetching user data for token:", error);
          // Set defaults on error
          token.paket = "free";
          token.quota = 1;
          token.status_pembayaran = "free";
        }
      }
      
      // Refresh user data if explicitly triggered
      if (trigger === "update" && !token.isAdmin) {
        try {
          const updateUserData = async () => {
            await dbConnect();
            const dbUser = await User.findOne({ email: token.email });
            if (dbUser) {
              token.paket = dbUser.paket;
              token.quota = dbUser.quota;
              token.status_pembayaran = dbUser.status_pembayaran;
            }
          };

          await Promise.race([
            updateUserData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Update timeout')), 3000)
            )
          ]);
        } catch (error) {
          console.error("Error updating user data in token:", error);
        }
      }
      
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/admin/login", // Redirect to admin login on error
  },
});
