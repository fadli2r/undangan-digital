import { withTimeout } from '../../../../lib/dbConnect';
import dbConnect, { checkDbHealth } from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import Admin from '../../../../models/Admin';
import User from '../../../../models/User';
import Invitation from '../../../../models/Invitation';

/** @type {import('next').NextApiHandler} */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check database health first
    const dbHealth = await checkDbHealth();
    if (dbHealth.status !== 'healthy') {
      return res.status(503).json({ 
        error: 'Database connection issues', 
        details: dbHealth 
      });
    }

    await dbConnect();

    // Check admin authentication
    const authResult = await adminAuth(req, res);
    if (!authResult || !authResult.success) {
      return res.status(401).json({ 
        error: authResult?.error || 'Authentication failed' 
      });
    }

    // Add admin info to request
    req.admin = authResult.admin;

    // Check if admin has dashboard.view permission
    if (!req.admin.permissions?.includes('dashboard.view')) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: 'dashboard.view',
        current: req.admin.permissions 
      });
    }

    // Get basic counts with timeout
    const [
      totalUsers,
      totalInvitations,
      activeInvitations,
      totalAdmins
    ] = await withTimeout(Promise.all([
      User.countDocuments(),
      Invitation.countDocuments(),
      Invitation.countDocuments({ status: 'active' }),
      Admin.countDocuments({ isActive: true })
    ]), 10000);

    const response = {
      overview: {
        totalUsers,
        totalInvitations,
        activeInvitations,
        totalAdmins
      },
      invitationStats: {
        active: activeInvitations,
        inactive: totalInvitations - activeInvitations
      },
      lastUpdated: new Date()
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    
    if (error.message?.includes('timed out')) {
      return res.status(504).json({ 
        error: 'Request timed out',
        details: error.message
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
