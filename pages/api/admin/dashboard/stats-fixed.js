import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../../lib/dbConnect';
import Admin from '../../../../models/Admin';
import User from '../../../../models/User';
import Invitation from '../../../../models/Invitation';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication with NextAuth
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Connect to database
    await dbConnect();

    // Verify admin exists and is active
    const admin = await Admin.findOne({ email: token.email, isActive: true });
    if (!admin) {
      return res.status(401).json({ error: 'Admin account not found or inactive' });
    }

    console.log('Fetching dashboard stats for admin:', admin.email);

    // Get basic counts with error handling
    let totalUsers = 0;
    let totalInvitations = 0;
    let activeInvitations = 0;
    let totalAdmins = 0;

    try {
      totalUsers = await User.countDocuments();
      console.log('Total users:', totalUsers);
    } catch (error) {
      console.error('Error counting users:', error);
    }

    try {
      totalInvitations = await Invitation.countDocuments();
      console.log('Total invitations:', totalInvitations);
    } catch (error) {
      console.error('Error counting invitations:', error);
    }

    try {
      activeInvitations = await Invitation.countDocuments({ status: 'active' });
      console.log('Active invitations:', activeInvitations);
    } catch (error) {
      console.error('Error counting active invitations:', error);
    }

    try {
      totalAdmins = await Admin.countDocuments({ isActive: true });
      console.log('Total admins:', totalAdmins);
    } catch (error) {
      console.error('Error counting admins:', error);
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newUsersToday = 0;
    let newInvitationsToday = 0;

    try {
      newUsersToday = await User.countDocuments({ 
        createdAt: { $gte: today } 
      });
      console.log('New users today:', newUsersToday);
    } catch (error) {
      console.error('Error counting new users today:', error);
    }

    try {
      newInvitationsToday = await Invitation.countDocuments({ 
        createdAt: { $gte: today } 
      });
      console.log('New invitations today:', newInvitationsToday);
    } catch (error) {
      console.error('Error counting new invitations today:', error);
    }

    // Get invitation status breakdown
    let invitationStats = {};
    try {
      const statusBreakdown = await Invitation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      invitationStats = statusBreakdown.reduce((acc, stat) => {
        acc[stat._id || 'unknown'] = stat.count;
        return acc;
      }, {});
      
      console.log('Invitation stats:', invitationStats);
    } catch (error) {
      console.error('Error getting invitation stats:', error);
    }

    // Get recent users (last 10)
    let recentUsers = [];
    try {
      recentUsers = await User.find()
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(10);
      console.log('Recent users count:', recentUsers.length);
    } catch (error) {
      console.error('Error getting recent users:', error);
    }

    // Get recent invitations (last 10)
    let recentInvitations = [];
    try {
      recentInvitations = await Invitation.find()
        .select('slug mempelai.pria mempelai.wanita status createdAt')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);
      console.log('Recent invitations count:', recentInvitations.length);
    } catch (error) {
      console.error('Error getting recent invitations:', error);
    }

    const response = {
      success: true,
      overview: {
        totalUsers,
        totalInvitations,
        activeInvitations,
        newUsersToday,
        newInvitationsToday,
        totalAdmins
      },
      invitationStats,
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      recentInvitations: recentInvitations.map(invitation => ({
        id: invitation._id,
        slug: invitation.slug,
        groomName: invitation.mempelai?.pria?.nama || 'N/A',
        brideName: invitation.mempelai?.wanita?.nama || 'N/A',
        status: invitation.status,
        user: invitation.user,
        createdAt: invitation.createdAt
      })),
      lastUpdated: new Date()
    };

    console.log('Dashboard stats response prepared successfully');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Dashboard Stats Critical Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
}
