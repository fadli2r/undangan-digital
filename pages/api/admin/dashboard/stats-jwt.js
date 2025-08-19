import { withTimeout } from '../../../../lib/dbConnect';
import dbConnect, { checkDbHealth } from '../../../../lib/dbConnect';
import adminAuthJWT from '../../../../middleware/adminAuthJWT';
import Admin from '../../../../models/Admin';
import User from '../../../../models/User';
import Invitation from '../../../../models/Invitation';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check database health first
    const dbHealth = await checkDbHealth();
    if (dbHealth.status !== 'healthy') {
      console.error('Database health check failed:', dbHealth);
      return res.status(503).json({ 
        error: 'Database connection issues', 
        details: dbHealth 
      });
    }

    await dbConnect();

    // Check admin authentication with timeout
    let authResult;
    try {
      authResult = await withTimeout(adminAuthJWT(req), 5000);
    } catch (err) {
      console.error('Admin auth timeout:', err);
      return res.status(401).json({ error: `Authentication timeout: ${err.message}` });
    }

    if (!authResult || !authResult.success) {
      console.error('Admin auth failed:', authResult?.error || 'Unknown error');
      return res.status(401).json({ error: authResult?.error || 'Authentication failed' });
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);

    try {
      // Get basic counts with timeout
      const basicCounts = await withTimeout(Promise.all([
        User.countDocuments(),
        Invitation.countDocuments(),
        User.countDocuments({ createdAt: { $gte: today } }),
        Invitation.countDocuments({ createdAt: { $gte: today } }),
        Admin.countDocuments({ isActive: true })
      ]), 5000);

      const [
        totalUsers,
        totalInvitations,
        newUsersToday,
        newInvitationsToday,
        totalAdmins
      ] = basicCounts;

      // Get active invitations with user details
      const activeInvitationsData = await withTimeout(
        Invitation.aggregate([
          {
            $match: {
              $or: [
                { 'acara_utama.tanggal': { $gte: today } },
                { 'acara_utama.tanggal': { $exists: false } }
              ]
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_email',
              foreignField: 'email',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              slug: 1,
              template: 1,
              'mempelai.pria': 1,
              'mempelai.wanita': 1,
              'acara_utama.tanggal': 1,
              'acara_utama.lokasi': 1,
              user_email: 1,
              'user.name': 1,
              'user.phone': 1,
              views: 1,
              createdAt: 1,
              'rsvp': { $size: { $ifNull: ['$rsvp', []] } },
              'ucapan': { $size: { $ifNull: ['$ucapan', []] } }
            }
          },
          {
            $sort: { createdAt: -1 }
          }
        ]),
        10000
      );

      const activeInvitations = activeInvitationsData.length;

      // Get invitation status breakdown with timeout
      const invitationStats = await withTimeout(
        Invitation.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        5000
      );

      // Get user growth data (last 30 days) with timeout
      const userGrowth = await withTimeout(
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]),
        5000
      );

      // Get invitation growth data (last 30 days) with timeout
      const invitationGrowth = await withTimeout(
        Invitation.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]),
        5000
      );

      // Get top templates usage with timeout
      const templateStats = await withTimeout(
        Invitation.aggregate([
          {
            $group: {
              _id: '$template',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 5
          }
        ]),
        5000
      );

      // Calculate percentage changes with timeout
      const [lastWeekUsers, thisWeekUsers] = await withTimeout(
        Promise.all([
          User.countDocuments({
            createdAt: { 
              $gte: new Date(now - 14 * 24 * 60 * 60 * 1000),
              $lt: thisWeek
            }
          }),
          User.countDocuments({
            createdAt: { $gte: thisWeek }
          })
        ]),
        5000
      );

      const userGrowthPercentage = lastWeekUsers > 0 
        ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers * 100).toFixed(1)
        : '0';

      const response = {
        overview: {
          totalUsers,
          totalInvitations,
          activeInvitations,
          newUsersToday,
          newInvitationsToday,
          totalAdmins,
          userGrowthPercentage: parseFloat(userGrowthPercentage)
        },
        activeInvitationsDetail: activeInvitationsData,
        invitationStats: invitationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        growth: {
          users: userGrowth,
          invitations: invitationGrowth
        },
        templateStats,
        lastUpdated: new Date()
      };

      return res.status(200).json(response);

    } catch (error) {
      if (error.message.includes('timed out')) {
        console.error('Dashboard Stats Timeout:', error);
        return res.status(504).json({ 
          error: 'Request timed out',
          details: error.message
        });
      }

      console.error('Dashboard Stats Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  } catch (outerError) {
    console.error('Dashboard Stats Critical Error:', outerError);
    return res.status(500).json({ 
      error: 'Critical error occurred',
      details: outerError.message
    });
  }
}
