import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect"; // pastikan path ini benar & satu sumber
import User from "../../../models/User";
import Admin from "../../../models/Admin";
import bcrypt from "bcryptjs";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // === Google OAuth (opsional) ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
    }),

    // === USER credentials ===
    CredentialsProvider({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          await dbConnect();

          // IMPORTANT: pilih password secara eksplisit
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true,
            isOAuthUser: false,
          }).select("+password");

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: false,
            role: "user",
            isOAuthUser: false,
          };
        } catch (err) {
          console.error("User authorize error:", err);
          return null; // akan memicu ?error=CredentialsSignin
        }
      },
    }),

    // === ADMIN credentials ===
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@domain.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          await dbConnect();

          // Pastikan ada admin seed
          await Admin.createInitialAdmin();

          // Ambil password
          const admin = await Admin.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true,
          }).select("+password");

          if (!admin) return null;

          let isValid = false;
          // Backdoor default (opsional—boleh dihapus di production)
          if (
            credentials.password === "admin123" &&
            admin.email === "admin@undangandigital.com"
          ) {
            isValid = true;
          } else {
            isValid = await bcrypt.compare(credentials.password, admin.password);
          }

          if (!isValid) return null;

          // Simpan lastLogin (non-blocking)
          admin.lastLogin = new Date();
          admin.loginHistory = admin.loginHistory || [];
          admin.loginHistory.push({
            timestamp: new Date(),
            ip: "127.0.0.1",
            userAgent: "NextAuth",
          });
          admin.save().catch((e) =>
            console.warn("Failed to update admin login history:", e)
          );

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            isAdmin: true,
            role: admin.role || "admin",
            permissions: admin.permissions || [],
          };
        } catch (err) {
          console.error("Admin authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Link/auto-create user ketika login dengan Google
      if (account?.provider === "google" && user?.email) {
        try {
          await dbConnect();
          let dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name || user.email.split("@")[0],
              isOAuthUser: true,
              isActive: true,
            });
            console.log("New OAuth user created:", user.email);
          } else if (!dbUser.isOAuthUser) {
            dbUser.isOAuthUser = true;
            await dbUser.save();
          }
        } catch (error) {
          console.error("Error in signIn callback (google):", error);
          // return false; // kalau mau gagalkan login saat error
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Login pertama kali—salin data dari user ke token
      if (user) {
        token.id = user.id;
        token.email = user.email;        // PENTING untuk sync onboarding
        token.isAdmin = !!user.isAdmin;
        token.role = user.role || (user.isAdmin ? "admin" : "user");
        token.permissions = user.permissions || [];
        token.isOAuthUser = !!user.isOAuthUser;
      }

      // Sinkronkan onboarding untuk USER saja
      if (!token.isAdmin && token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email })
            .select("onboardingCompleted onboardingStep")
            .lean();
          if (dbUser) {
            token.onboardingCompleted = !!dbUser.onboardingCompleted;
            token.onboardingStep =
              typeof dbUser.onboardingStep === "number" ? dbUser.onboardingStep : 1;
          }
        } catch (err) {
          console.error("JWT sync onboarding error:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.isAdmin = !!token.isAdmin;

        if (token.isAdmin) {
          session.user.permissions = token.permissions || [];
        } else {
          session.user.isOAuthUser = !!token.isOAuthUser;
          session.user.onboardingCompleted = !!token.onboardingCompleted;
          session.user.onboardingStep =
            typeof token.onboardingStep === "number" ? token.onboardingStep : 1;
        }
      }
      return session;
    },

    // Opsional: arahkan otomatis berdasarkan role
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        // izinkan callbackUrl absolute internal
        if (u.origin === baseUrl) return u.toString();
        // default ke beranda
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login", // halaman login custom
    error: "/login",  // tampilkan error di login
  },
};

export default NextAuth(authOptions);
