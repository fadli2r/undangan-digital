import dbConnect from '../../../../lib/dbConnect';
import Coupon from '../../../../models/Coupon';
import Package from '../../../../models/Package';
import adminAuth from '../../../../middleware/adminAuth';

export default async function handler(req, res) {
  await dbConnect();

  // Verify admin authentication
  const authMiddleware = adminAuth();
  
  // Create a promise to handle middleware
  const authResult = await new Promise((resolve, reject) => {
    authMiddleware(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  }).catch(() => {
    return res.status(401).json({ error: 'Unauthorized' });
  });

  if (!authResult) return;

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 10,
          search = '',
          status = 'all',
          type = 'all',
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Build filter query
        let filter = {};

        // Search filter
        if (search) {
          filter.$or = [
            { code: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }

        // Status filter
        const now = new Date();
        if (status !== 'all') {
          switch (status) {
            case 'active':
              filter.isActive = true;
              filter.startDate = { $lte: now };
              filter.endDate = { $gte: now };
              break;
            case 'inactive':
              filter.isActive = false;
              break;
            case 'expired':
              filter.endDate = { $lt: now };
              break;
            case 'scheduled':
              filter.startDate = { $gt: now };
              break;
            case 'exhausted':
              filter.$expr = {
                $and: [
                  { $ne: ['$usageLimit', null] },
                  { $gte: ['$usageCount', '$usageLimit'] }
                ]
              };
              break;
          }
        }

        // Type filter
        if (type !== 'all') {
          filter.type = type;
        }

        // Get coupons with pagination
        const coupons = await Coupon.find(filter)
          .populate('createdBy', 'name email')
          .populate('applicablePackages', 'name price')
          .populate('excludedPackages', 'name price')
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(parseInt(limit));

        // Get total count
        const total = await Coupon.countDocuments(filter);

        // Calculate statistics
        const stats = await Coupon.aggregate([
          {
            $group: {
              _id: null,
              totalCoupons: { $sum: 1 },
              activeCoupons: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$isActive', true] },
                        { $lte: ['$startDate', now] },
                        { $gte: ['$endDate', now] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              totalUsage: { $sum: '$usageCount' },
              totalDiscountGiven: {
                $sum: {
                  $reduce: {
                    input: '$usageHistory',
                    initialValue: 0,
                    in: { $add: ['$$value', '$$this.discountAmount'] }
                  }
                }
              }
            }
          }
        ]);

        res.status(200).json({
          coupons,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          },
          stats: stats[0] || {
            totalCoupons: 0,
            activeCoupons: 0,
            totalUsage: 0,
            totalDiscountGiven: 0
          }
        });
      } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
      }
      break;

    case 'POST':
      try {
        const {
          code,
          name,
          description,
          type,
          value,
          minimumAmount,
          maximumDiscount,
          usageLimit,
          userUsageLimit,
          startDate,
          endDate,
          isActive,
          applicablePackages,
          excludedPackages
        } = req.body;

        // Validate required fields
        if (!code || !name || !type || !value || !startDate || !endDate) {
          return res.status(400).json({ 
            error: 'Kode, nama, tipe, nilai, tanggal mulai, dan tanggal berakhir wajib diisi' 
          });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ 
          code: code.toUpperCase() 
        });
        
        if (existingCoupon) {
          return res.status(400).json({ 
            error: 'Kode kupon sudah digunakan' 
          });
        }

        // Validate date range
        if (new Date(endDate) <= new Date(startDate)) {
          return res.status(400).json({ 
            error: 'Tanggal berakhir harus setelah tanggal mulai' 
          });
        }

        // Validate percentage value
        if (type === 'percentage' && (value <= 0 || value > 100)) {
          return res.status(400).json({ 
            error: 'Persentase diskon harus antara 1-100%' 
          });
        }

        // Validate fixed value
        if (type === 'fixed' && value <= 0) {
          return res.status(400).json({ 
            error: 'Nilai diskon harus lebih dari 0' 
          });
        }

        // Create new coupon
        const newCoupon = new Coupon({
          code: code.toUpperCase(),
          name,
          description,
          type,
          value: parseFloat(value),
          minimumAmount: parseFloat(minimumAmount) || 0,
          maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : undefined,
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
          userUsageLimit: parseInt(userUsageLimit) || 1,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive !== false,
          applicablePackages: applicablePackages || [],
          excludedPackages: excludedPackages || [],
          createdBy: adminUser._id
        });

        await newCoupon.save();

        // Populate the created coupon
        const populatedCoupon = await Coupon.findById(newCoupon._id)
          .populate('createdBy', 'name email')
          .populate('applicablePackages', 'name price')
          .populate('excludedPackages', 'name price');

        res.status(201).json({
          message: 'Kupon berhasil dibuat',
          coupon: populatedCoupon
        });
      } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Failed to create coupon' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
