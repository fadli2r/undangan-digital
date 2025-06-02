import { getSession } from "next-auth/react";

// Mock paket data (in real app, this would come from database)
const paketList = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 25000,
    features: [
      "1 Template Undangan",
      "RSVP Digital",
      "Galeri Foto",
      "Amplop Digital"
    ]
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 50000,
    features: [
      "Semua Fitur Basic",
      "15 Galeri Foto",
      "Pilih Template Premium",
      "Countdown, Musik, Maps"
    ]
  }
};

// Mock promo codes (in real app, this would come from database)
const promoCodes = {
  "PROMO10": { discount: 0.1, type: "percentage" },  // 10% off
  "PROMO20": { discount: 0.2, type: "percentage" },  // 20% off
  "DISC5K": { discount: 5000, type: "fixed" }        // Rp 5.000 off
};

// Mock referral codes (in real app, this would come from database)
const referralCodes = {
  "REF5": { discount: 0.05, type: "percentage" },    // 5% off
  "REF10": { discount: 0.1, type: "percentage" }     // 10% off
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, promoCode, referralCode } = req.query;

  // Get the paket
  const paket = paketList[id];
  if (!paket) {
    return res.status(404).json({ message: 'Paket tidak ditemukan' });
  }

  // Calculate discounts
  let totalDiscount = 0;
  let discountDetails = [];

  // Apply promo code if valid
  if (promoCode && promoCodes[promoCode]) {
    const promo = promoCodes[promoCode];
    const promoDiscount = promo.type === 'percentage' 
      ? paket.price * promo.discount 
      : promo.discount;
    
    totalDiscount += promoDiscount;
    discountDetails.push({
      type: 'promo',
      code: promoCode,
      amount: promoDiscount
    });
  }

  // Apply referral code if valid
  if (referralCode && referralCodes[referralCode]) {
    const referral = referralCodes[referralCode];
    const referralDiscount = referral.type === 'percentage'
      ? paket.price * referral.discount
      : referral.discount;
    
    totalDiscount += referralDiscount;
    discountDetails.push({
      type: 'referral',
      code: referralCode,
      amount: referralDiscount
    });
  }

  // Calculate final price
  const finalPrice = Math.max(0, paket.price - totalDiscount);

  return res.status(200).json({
    paket: {
      ...paket,
      originalPrice: paket.price,
      discounts: discountDetails,
      totalDiscount,
      finalPrice
    }
  });
}
