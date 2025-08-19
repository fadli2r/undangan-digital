import { getToken } from 'next-auth/jwt';
import dbConnect from '../lib/dbConnect';
import Admin from '../models/Admin';

export default async function adminAuth(req, res) {
  try {
    await dbConnect();
    
    // Get token from NextAuth JWT
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return { success: false, error: 'No session found' };
    }

    // Check if user is admin
    if (!token.isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    // Get admin from database to ensure they still exist and are active
    const admin = await Admin.findOne({ email: token.email });
    if (!admin || !admin.isActive) {
      return { success: false, error: 'Admin account not found or inactive' };
    }

    // Return success with admin info (use token permissions for better performance)
    return {
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: token.permissions || admin.permissions || []
      }
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return { success: false, error: 'Authentication error' };
  }
}
