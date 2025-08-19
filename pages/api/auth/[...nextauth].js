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
      id: 'user-credentials',
      name: 'User Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('User login attempt:', credentials.email);
          
          // Add timeout to database operations
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
          
          if (!user) {
            console.log(`Failed login attempt: ${credentials.email} - User not found`);
            return null;
          }

          // Compare password
          const isValidPassword = await user.comparePassword(credentials.password);

          if (!isValidPassword) {
            console.log(`Failed login attempt: ${credentials.email} - Invalid password`);
            return null;
          }

          console.log(`Successful user login: ${credentials.email}`);
          
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
          
          // Add timeout to database operations
          const { withTimeout } = await import("../../../lib/dbConnect");
          
          await withTimeout(dbConnect(), 10000);
          
          // Create initial admin if it doesn't exist
          await withTimeout(Admin.createInitialAdmin(), 5000);
          
          const admin = await withTimeout(
            Admin.findOne({ 
              email: credentials.email.toLowerCase(), 
              isActive: true 
            }),
            5000
          );
          
          if (!admin) {
            console.log(`Failed login attempt: ${credentials.email} - Admin not found`);
            return null;
          }

          // For initial setup, allow hardcoded password, otherwise use bcrypt comparison
          let isValidPassword = false;
          if (credentials.password === 'admin123' && admin.email === 'admin@undangandigital.com') {
            isValidPassword = true;
            console.log('Using default admin credentials');
          } else {
            isValidPassword = await admin.comparePassword(credentials.password);
          }

          if (!isValidPassword) {
            console.log(`Failed login attempt: ${credentials.email} - Invalid password`);
            return null;
          }

          // Update last login (with timeout)
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
            // Don't fail login if we can't update history
          }

          console.log(`Successful admin login: ${credentials.email}`);
          
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
            
            // If not, create new user with OAuth flag
            if (!dbUser) {
              dbUser = await User.create({
                email: user.email,
                name: user.name,
                isOAuthUser: true
              });
              console.log("New OAuth user created:", user.email);
            } else {
              // Update existing user to mark as OAuth user if not already
              if (!dbUser.isOAuthUser) {
                dbUser.isOAuthUser = true;
                await dbUser.save();
              }
              console.log("Existing user found:", user.email);
            }
          };

          // Execute with timeout using our utility function
          const { withTimeout } = await import("../../../lib/dbConnect");
          await withTimeout(dbOperation(), 8000);
          
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
        session.user.permissions = token.permissions || [];
      } else {
        session.user.isAdmin = false;
        session.user.isOAuthUser = token.isOAuthUser || false;
        // Add user-specific data if needed
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user?.isAdmin) {
        // Store admin info in token
        token.isAdmin = true;
        token.role = user.role;
        
        // Get admin permissions from database
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
        // Store user info in token
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
    error: "/admin/login", // Redirect to admin login on error
  },
});
