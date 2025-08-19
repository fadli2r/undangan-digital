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
      return { success: false, error: 'No authentication token found' };
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
        permissions: admin.permissions || ['dashboard.view', 'users.view', 'invitations.view', 'packages.view', 'orders.view', 'coupons.view', 'settings.view']
      }
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return { success: false, error: 'Authentication error' };
  }
}

// Helper function for API routes that need admin authentication
export async function requireAdminAuth(req, res) {
  const authResult = await adminAuth(req, res);
  
  if (!authResult.success) {
    return res.status(401).json({ 
      error: authResult.error,
      code: 'UNAUTHORIZED'
    });
  }
  
  // Add admin info to request object
  req.admin = authResult.admin;
  return authResult;
}
