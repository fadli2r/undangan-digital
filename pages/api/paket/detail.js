import { getSession } from "next-auth/react";
import dbConnect from '../../../lib/dbConnect';
import Package from '../../../models/Package';
import Coupon from '../../../models/Coupon';
import User from '../../../models/User';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { id, promoCode, referralCode, userId, userEmail } = req.query;

    // Get package from database
    let paket;
    
    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      paket = await Package.findOne({ 
        $or: [
          { _id: id },
          { slug: id }
        ],
        isActive: true 
      });
    } else {
      // If not valid ObjectId, search by slug only
      paket = await Package.findOne({ 
        slug: id,
        isActive: true 
      });
    }

    if (!paket) {
      return res.status(404).json({ message: 'Paket tidak ditemukan' });
    }

    // Get user ID from session or query
    let currentUserId = userId;
    if (!currentUserId) {
      // Try to get from userEmail parameter
      if (userEmail) {
        const user = await User.findOne({ email: userEmail });
        currentUserId = user?._id;
      } else {
        // Fallback to session
        const session = await getSession({ req });
        if (session?.user?.email) {
          const user = await User.findOne({ email: session.user.email });
          currentUserId = user?._id;
        }
      }
    }

    // Initialize response data
    let responseData = {
      id: paket._id,
      name: paket.name,
      description: paket.description,
      price: paket.price,
      originalPrice: paket.originalPrice || paket.price,
      features: paket.features?.map(f => f.name) || [],
      limits: paket.limits,
      finalPrice: paket.price,
      discounts: [],
      totalDiscount: 0
    };

    let totalDiscount = 0;
    let discountDetails = [];

    // Apply promo code if provided
    if (promoCode && currentUserId) {
      try {
        const coupon = await Coupon.findOne({ 
          code: promoCode.toUpperCase(),
          isActive: true
        });

        if (coupon) {
          const validation = coupon.isValidForUser(currentUserId, paket._id, paket.price);
          
          if (validation.valid) {
            const promoDiscount = coupon.calculateDiscount(paket.price);
            totalDiscount += promoDiscount;
            discountDetails.push({
              type: 'promo',
              code: promoCode.toUpperCase(),
              name: coupon.name,
              amount: promoDiscount,
              couponId: coupon._id
            });
          } else {
            // Return error for invalid coupon but continue processing
            discountDetails.push({
              type: 'promo',
              code: promoCode.toUpperCase(),
              error: validation.reason,
              amount: 0
            });
          }
        } else {
          discountDetails.push({
            type: 'promo',
            code: promoCode.toUpperCase(),
            error: 'Kode kupon tidak valid',
            amount: 0
          });
        }
      } catch (error) {
        console.error('Error validating promo code:', error);
        discountDetails.push({
          type: 'promo',
          code: promoCode.toUpperCase(),
          error: 'Terjadi kesalahan saat memvalidasi kupon',
          amount: 0
        });
      }
    }

    // Apply referral code if provided (similar logic)
    if (referralCode && currentUserId) {
      try {
        const referralCoupon = await Coupon.findOne({ 
          code: referralCode.toUpperCase(),
          isActive: true
        });

        if (referralCoupon) {
          const validation = referralCoupon.isValidForUser(currentUserId, paket._id, paket.price);
          
          if (validation.valid) {
            const referralDiscount = referralCoupon.calculateDiscount(paket.price);
            totalDiscount += referralDiscount;
            discountDetails.push({
              type: 'referral',
              code: referralCode.toUpperCase(),
              name: referralCoupon.name,
              amount: referralDiscount,
              couponId: referralCoupon._id
            });
          } else {
            discountDetails.push({
              type: 'referral',
              code: referralCode.toUpperCase(),
              error: validation.reason,
              amount: 0
            });
          }
        } else {
          discountDetails.push({
            type: 'referral',
            code: referralCode.toUpperCase(),
            error: 'Kode referral tidak valid',
            amount: 0
          });
        }
      } catch (error) {
        console.error('Error validating referral code:', error);
        discountDetails.push({
          type: 'referral',
          code: referralCode.toUpperCase(),
          error: 'Terjadi kesalahan saat memvalidasi kode referral',
          amount: 0
        });
      }
    }

    // Calculate final price
    const finalPrice = Math.max(0, paket.price - totalDiscount);

    // Update response data
    responseData.discounts = discountDetails;
    responseData.totalDiscount = totalDiscount;
    responseData.finalPrice = finalPrice;

    return res.status(200).json({
      paket: responseData,
      message: totalDiscount > 0 ? 
        `Diskon berhasil diterapkan! Total hemat: Rp ${totalDiscount.toLocaleString()}` : 
        null
    });

  } catch (error) {
    console.error('Error in paket detail API:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data paket' 
    });
  }
}
