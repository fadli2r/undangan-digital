import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect';
import Admin from '../models/Admin';

export default function adminAuth(requiredPermissions = []) {
  return async (req, res, next) => {
    try {
      await dbConnect();
      
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret');
        
        // Check if user is admin
        if (!decoded.isAdmin) {
          return res.status(403).json({ error: 'Admin access required' });
        }

        // Get admin from database to ensure they still exist and are active
        const admin = await Admin.findById(decoded.sub);
        if (!admin || !admin.isActive) {
          return res.status(401).json({ error: 'Admin account not found or inactive' });
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => 
            admin.permissions && admin.permissions.includes(permission)
          );
          
          if (!hasPermission) {
            return res.status(403).json({ 
              error: 'Insufficient permissions',
              required: requiredPermissions,
              current: admin.permissions || []
            });
          }
        }

        // Add admin info to request with proper ObjectId
        req.admin = {
          _id: admin._id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || []
        };

        next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}
