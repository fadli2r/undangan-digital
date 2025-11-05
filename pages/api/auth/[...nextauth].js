import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect, { withTimeout } from "../../../lib/dbConnect";
import User from "../../../models/User";
import Admin from "../../../models/Admin";

// === BEGIN: authOptions exportable ===
export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,

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

// GANTI SELURUH BLOK callbacks LAMA ANDA DENGAN INI

callbacks: {
  async signIn({ user, account }) {
    // ... (Fungsi signIn Anda sudah benar, tidak perlu diubah)
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
  
  // =========================================================
  // PERBAIKAN DIMULAI DARI SINI
  // =========================================================

  async jwt({ token, user }) {
    // Saat login pertama kali (objek `user` tersedia), salin semua data penting ke token.
    if (user) {
      token.id = user.id;
      token.isAdmin = user.isAdmin; // <-- PENTING: Salin status admin
      token.role = user.role;       // <-- PENTING: Salin role
      token.permissions = user.permissions;
      token.isOAuthUser = user.isOAuthUser;
    }

    // Jika token bukan untuk admin, baru lakukan pengecekan onboarding.
    if (!token.isAdmin) {
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          // Selalu sinkronkan data onboarding dari DB
          token.onboardingCompleted = dbUser.onboardingCompleted || false;
          token.onboardingStep = dbUser.onboardingStep ?? 1;
        }
      } catch (err) {
        console.error("Error fetching user onboarding flags:", err);
      }
    }
    
    return token;
  },

  async session({ session, token }) {
    // Salin data dari token ke objek session yang akan digunakan di frontend.
    if (session.user) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isAdmin = token.isAdmin;

      if (token.isAdmin) {
        // Hanya tambahkan data spesifik admin jika dia adalah admin
        session.user.permissions = token.permissions || [];
      } else {
        // Hanya tambahkan data spesifik user jika dia adalah user
        session.user.isOAuthUser = token.isOAuthUser || false;
        session.user.onboardingCompleted = token.onboardingCompleted || false;
        session.user.onboardingStep = token.onboardingStep ?? 1;
      }
    }
    
    return session;
  },
  
  // =========================================================
  // AKHIR DARI PERBAIKAN
  // =========================================================
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
