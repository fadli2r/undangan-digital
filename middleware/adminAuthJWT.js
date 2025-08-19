import jwt from 'jsonwebtoken';
import dbConnect from '../lib/dbConnect';
import Admin from '../models/Admin';

export default async function adminAuthJWT(req) {
  try {
    await dbConnect();
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token found' };
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);
    
    // Check if JWT_SECRET is set, use NEXTAUTH_SECRET as fallback
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET or NEXTAUTH_SECRET is not set in environment variables');
      return { success: false, error: 'Server configuration error' };
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Invalid token' };
    }

    // Check if user is admin
    if (!decoded.isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    // Get admin from database to ensure they still exist and are active
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin || !admin.isActive) {
      return { success: false, error: 'Admin account not found or inactive' };
    }

    // Return success with admin info
    return {
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: decoded.permissions || admin.permissions || []
      }
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return { success: false, error: 'Authentication error' };
  }
}
