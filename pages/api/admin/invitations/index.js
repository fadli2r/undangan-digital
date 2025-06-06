import dbConnect from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import Invitation from '../../../../models/Invitation';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['invitations.view'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  switch (req.method) {
    case 'GET':
      return await getInvitations(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getInvitations(req, res) {
  try {
    const {
      search = '',
      status = 'all',
      template = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { 'mempelai.pria': { $regex: search, $options: 'i' } },
        { 'mempelai.wanita': { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Template filter
    if (template !== 'all') {
      query.template = template;
    }

    // Build sort object
    const sort = {};
    if (sortBy.includes('.')) {
      // Handle nested fields like 'mempelai.pria'
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get invitations with pagination
    const [invitations, totalInvitations] = await Promise.all([
      Invitation.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invitation.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalInvitations / limitNum);

    // Get additional stats for each invitation
    const invitationsWithStats = await Promise.all(
      invitations.map(async (invitation) => {
        // You can add more stats here like RSVP count, wishes count, etc.
        return {
          ...invitation
          // Add any additional computed fields here
        };
      })
    );

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'invitations.view',
      details: {
        filters: { search, status, template, sortBy, sortOrder },
        pagination: { page: pageNum, limit: limitNum }
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      invitations: invitationsWithStats,
      currentPage: pageNum,
      totalPages,
      totalInvitations,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Get Invitations Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
