// /pages/api/orders/create.js
import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();

  const { email, paket, harga, invoice_id } = req.body;
  if (!email) return res.status(400).json({ message: "No email" });

  try {
    // Check if order already exists
    const existingOrder = await Order.findOne({ invoice_id });
    if (existingOrder) {
      return res.status(200).json({ order: existingOrder });
    }

    // Create new order
    const order = await Order.create({
      email,
      paket,
      harga,
      status: "paid", // or based on webhook
      invoice_id,
      date: new Date(),
      used: false,
      invitation_slug: null
    });

    // Update user quota in a transaction
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await User.updateOne(
        { email }, 
        { $inc: { quota: 1 } },
        { session }
      );
    });
    await session.endSession();

    res.status(200).json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
}
