import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import Admin from "../../../models/Admin";

// === BEGIN: authOptions exportable ===
export const authOptions = {
  providers: [
    // === User OAuth (Google) ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // === User Credentials ===
    CredentialsProvider({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("User login attempt:", credentials.email);
          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbConnect(), 10000);

          const user = await withTimeout(
            User.findOne({
              email: credentials.email.toLowerCase(),
              isActive: true,
              isOAuthUser: false,
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
            role: "user",
            isOAuthUser: false,
          };
        } catch (error) {
          console.error("Error in user authorization:", error);
          return null;
        }
      },
    }),

    // === Admin Credentials ===
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Admin login attempt:", credentials.email);
          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbConnect(), 10000);

          // Pastikan ada admin default
          await withTimeout(Admin.createInitialAdmin(), 5000);

          const admin = await withTimeout(
            Admin.findOne({
              email: credentials.email.toLowerCase(),
              isActive: true,
            }),
            5000
          );

          if (!admin) return null;

          let isValidPassword = false;
          if (
            credentials.password === "admin123" &&
            admin.email === "admin@undangandigital.com"
          ) {
            isValidPassword = true;
          } else {
            isValidPassword = await admin.comparePassword(credentials.password);
          }

          if (!isValidPassword) return null;

          try {
            admin.lastLogin = new Date();
            admin.loginHistory.push({
              timestamp: new Date(),
              ip: "127.0.0.1",
              userAgent: "NextAuth",
            });
            await withTimeout(admin.save(), 3000);
          } catch (saveError) {
            console.warn("Failed to update admin login history:", saveError);
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            isAdmin: true,
            role: admin.role || "admin",
            permissions: admin.permissions,
          };
        } catch (error) {
          console.error("Error in admin authorization:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // === Jika user login via Google ===
      if (account?.provider === "google") {
        try {
          const dbOperation = async () => {
            await dbConnect();
            let dbUser = await User.findOne({ email: user.email });

            if (!dbUser) {
              dbUser = await User.create({
                email: user.email,
                name: user.name,
                isOAuthUser: true,
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
  session.user = session.user || {};
  session.user.id = token.id;
  session.user.name = token.name;
  session.user.email = token.email;

  if (token.isAdmin) {
    // ADMIN: jangan sematkan flag onboarding agar tak ikut divalidasi di frontend
    session.user.isAdmin = true;
    session.user.role = token.role || "admin";
    session.user.permissions = token.permissions || [];

    // pastikan tidak ada field onboarding pada admin
    delete session.user.onboardingCompleted;
    delete session.user.onboardingStep;
  } else {
    // USER BIASA
    session.user.isAdmin = false;
    session.user.role = "user";
    session.user.isOAuthUser = token.isOAuthUser || false;

    // sematkan flag onboarding dari token (sudah diisi di jwt callback)
    session.user.onboardingCompleted = !!token.onboardingCompleted;
    session.user.onboardingStep =
      Number.isFinite(token.onboardingStep) ? token.onboardingStep : 1;
  }

  return session;
},

    async jwt({ token, user }) {
  // identitas dasar saat login
  if (user) {
    token.id = user.id || token.id;
    token.name = user.name || token.name;
    token.email = user.email || token.email;
  }

  if (token.isAdmin) {
    return token; // admin skip onboarding check
  }

  try {
    await dbConnect();
    const dbUser = await User.findOne({ email: token.email }).lean();
    token.isAdmin = false;
    token.isOAuthUser = dbUser?.isOAuthUser || false;
    token.role = "user";

    // selalu sync flag dari DB
    token.onboardingCompleted = dbUser?.onboardingCompleted || false;
    token.onboardingStep = dbUser?.onboardingStep ?? 1;
  } catch (err) {
    console.error("Error fetching user onboarding flags:", err);
    token.onboardingCompleted = false;
    token.onboardingStep = 1;
  }

  return token;
}

  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login", // default untuk user
    error: "/login",  // default error
  },
};
// === END: authOptions ===

export default NextAuth(authOptions);
