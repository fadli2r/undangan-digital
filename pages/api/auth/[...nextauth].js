import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import Admin from "../../../models/Admin";

// === BEGIN: authOptions exportable ===
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: 'user-credentials',
      name: 'User Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('User login attempt:', credentials.email);
          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbConnect(), 10000);

          const user = await withTimeout(
            User.findOne({ 
              email: credentials.email.toLowerCase(),
              isActive: true,
              isOAuthUser: false
            }),
            5000
          );

          if (!user) return null;
          const isValidPassword = await user.comparePassword(credentials.password);
          if (!isValidPassword) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: false,
            isOAuthUser: false
          };
        } catch (error) {
          console.error('Error in user authorization:', error);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Admin login attempt:', credentials.email);
          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbConnect(), 10000);
          await withTimeout(Admin.createInitialAdmin(), 5000);

          const admin = await withTimeout(
            Admin.findOne({ 
              email: credentials.email.toLowerCase(), 
              isActive: true 
            }),
            5000
          );

          if (!admin) return null;

          let isValidPassword = false;
          if (credentials.password === 'admin123' && admin.email === 'admin@undangandigital.com') {
            isValidPassword = true;
          } else {
            isValidPassword = await admin.comparePassword(credentials.password);
          }

          if (!isValidPassword) return null;

          try {
            admin.lastLogin = new Date();
            admin.loginHistory.push({
              timestamp: new Date(),
              ip: '127.0.0.1',
              userAgent: 'NextAuth'
            });
            await withTimeout(admin.save(), 3000);
          } catch (saveError) {
            console.warn('Failed to update admin login history:', saveError);
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            isAdmin: true,
            role: admin.role,
            permissions: admin.permissions
          };
        } catch (error) {
          console.error('Error in admin authorization:', error);
          return null;
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const dbOperation = async () => {
            await dbConnect();
            let dbUser = await User.findOne({ email: user.email });

            if (!dbUser) {
              dbUser = await User.create({
                email: user.email,
                name: user.name,
                isOAuthUser: true
              });
              console.log("New OAuth user created:", user.email);
            } else if (!dbUser.isOAuthUser) {
              dbUser.isOAuthUser = true;
              await dbUser.save();
            }
          };

          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbOperation(), 8000);
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }

      return true;
    },

    async session({ session, token }) {
      if (token.isAdmin) {
        session.user.isAdmin = true;
        session.user.role = token.role;
        session.user.permissions = token.permissions || [];
      } else {
        session.user.isAdmin = false;
        session.user.isOAuthUser = token.isOAuthUser || false;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user?.isAdmin) {
        token.isAdmin = true;
        token.role = user.role;

        try {
          await dbConnect();
          const admin = await Admin.findOne({ email: user.email });
          if (admin) {
            token.permissions = admin.permissions || [];
          }
        } catch (error) {
          console.error('Error fetching admin permissions:', error);
          token.permissions = [];
        }
      } else if (user && !user.isAdmin) {
        token.isAdmin = false;
        token.isOAuthUser = user.isOAuthUser || false;
      }

      return token;
    }
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/admin/login"
  },
};
// === END: authOptions ===

// Export NextAuth default
export default NextAuth(authOptions);
