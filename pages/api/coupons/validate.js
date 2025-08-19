import dbConnect from '../../../lib/dbConnect';
import Coupon from '../../../models/Coupon';
import Package from '../../../models/Package';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { code, userId, packageId, orderAmount } = req.body;

    // Validate required fields
    if (!code || !userId || !packageId || !orderAmount) {
      return res.status(400).json({ 
        error: 'Kode kupon, user ID, package ID, dan jumlah order diperlukan' 
      });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    }).populate('applicablePackages excludedPackages');

    if (!coupon) {
      return res.status(404).json({ 
        error: 'Kode kupon tidak valid' 
      });
    }

    // Validate coupon for user
    const validation = coupon.isValidForUser(userId, packageId, orderAmount);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.reason 
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.status(200).json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value
      },
      discountAmount,
      finalAmount,
      message: `Kupon berhasil diterapkan! Anda mendapat diskon Rp ${discountAmount.toLocaleString()}`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memvalidasi kupon' });
  }
}
