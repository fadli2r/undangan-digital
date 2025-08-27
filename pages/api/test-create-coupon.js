import dbConnect from '../../lib/dbConnect';
import Coupon from '../../models/Coupon';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Create a test admin user first (for createdBy field)
    let adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      adminUser = new User({
        email: 'admin@test.com',
        name: 'Test Admin',
        password: 'hashedpassword',
        isVerified: true
      });
      await adminUser.save();
    }

    // Create test coupons
    const testCoupons = [
      {
        code: 'PROMO10',
        name: 'Diskon 10%',
        description: 'Diskon 10% untuk semua paket',
        type: 'percentage',
        value: 10,
        minimumAmount: 0,
        maximumDiscount: 50000,
        usageLimit: 100,
        userUsageLimit: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdBy: adminUser._id
      },
      {
        code: 'DISC5K',
        name: 'Diskon Rp 5.000',
        description: 'Potongan langsung Rp 5.000',
        type: 'fixed',
        value: 5000,
        minimumAmount: 25000,
        usageLimit: 50,
        userUsageLimit: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdBy: adminUser._id
      },
      {
        code: 'REF10',
        name: 'Referral 10%',
        description: 'Diskon referral 10%',
        type: 'percentage',
        value: 10,
        minimumAmount: 0,
        maximumDiscount: 25000,
        usageLimit: 200,
        userUsageLimit: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    // Clear existing test coupons
    await Coupon.deleteMany({ code: { $in: ['PROMO10', 'DISC5K', 'REF10'] } });

    // Insert new coupons
    const savedCoupons = await Coupon.insertMany(testCoupons);

    res.status(200).json({
      message: 'Test coupons created successfully',
      coupons: savedCoupons.map(c => ({
        code: c.code,
        name: c.name,
        type: c.type,
        value: c.value
      }))
    });

  } catch (error) {
    console.error('Error creating test coupons:', error);
    res.status(500).json({ 
      message: 'Error creating test coupons',
      error: error.message 
    });
  }
}
