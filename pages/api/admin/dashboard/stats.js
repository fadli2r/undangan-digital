import dbConnect from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import Admin from '../../../../models/Admin';
import User from '../../../../models/User';
import Invitation from '../../../../models/Invitation';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Apply admin authentication middleware
    await new Promise((resolve, reject) => {
      adminAuth(['dashboard.view'])(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get basic counts
    const [
      totalUsers,
      totalInvitations,
      activeInvitations,
      newUsersToday,
      newInvitationsToday,
      totalAdmins
    ] = await Promise.all([
      User.countDocuments(),
      Invitation.countDocuments(),
      Invitation.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Invitation.countDocuments({ createdAt: { $gte: today } }),
      Admin.countDocuments({ isActive: true })
    ]);

    // Get invitation status breakdown
    const invitationStats = await Invitation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user growth data (last 30 days)
    const userGrowth = await User.aggregate([
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
    ]);

    // Get invitation growth data (last 30 days)
    const invitationGrowth = await Invitation.aggregate([
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
    ]);

    // Get recent activity
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('actor', 'name email')
      .populate('target');

    // Get expiring invitations (next 7 days)
    const expiringInvitations = await Invitation.find({
      expiresAt: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .select('slug mempelai.pria mempelai.wanita expiresAt user')
    .populate('user', 'name email')
    .sort({ expiresAt: 1 })
    .limit(10);

    // Get top templates usage
    const templateStats = await Invitation.aggregate([
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
    ]);

    // Calculate percentage changes
    const lastWeekUsers = await User.countDocuments({
      createdAt: { 
        $gte: new Date(now - 14 * 24 * 60 * 60 * 1000),
        $lt: thisWeek
      }
    });

    const thisWeekUsers = await User.countDocuments({
      createdAt: { $gte: thisWeek }
    });

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
      invitationStats: invitationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      growth: {
        users: userGrowth,
        invitations: invitationGrowth
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        action: activity.action,
        actor: activity.actor,
        details: activity.details,
        createdAt: activity.createdAt
      })),
      expiringInvitations,
      templateStats,
      lastUpdated: new Date()
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
