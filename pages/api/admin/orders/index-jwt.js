import dbConnect from '../../../../lib/dbConnect';
import adminAuthJWT from '../../../../middleware/adminAuthJWT';
import Order from '../../../../models/Order';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  await dbConnect();

  // Check admin authentication
  const authResult = await adminAuthJWT(req);
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }

  // Add admin info to request
  req.admin = authResult.admin;

  switch (req.method) {
    case 'GET':
      return await getOrders(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getOrders(req, res) {
  try {
    const {
      search = '',
      status = 'all',
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { invoice_id: { $regex: search, $options: 'i' } },
        { paket: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders with pagination
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNum);

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'dashboard.view',
      details: {
        section: 'orders',
        filters: { search, status, sortBy, sortOrder },
        pagination: { page: pageNum, limit: limitNum }
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      orders,
      currentPage: pageNum,
      totalPages,
      totalOrders,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
