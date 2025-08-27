import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    await dbConnect();

    // Stream body karena bodyParser false
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();
    const event = JSON.parse(rawBody);

    console.log('[WEBHOOK]', event);

    // Validasi event
    if (event.status === 'PAID' && event.external_id) {
      const externalId = event.external_id;

      const order = await Order.findOne({ invoice_id: externalId });
      if (!order) {
        console.warn('[WEBHOOK] Order tidak ditemukan:', externalId);
        return res.status(404).end();
      }

      if (order.status === 'completed') {
        console.log('[WEBHOOK] Order sudah completed, skip:', externalId);
        return res.status(200).end();
      }

      // Update order
      order.status = 'completed';
      await order.save();

      // Update user
      const user = await User.findOne({ email: order.email });
      if (!user) {
        console.warn('[WEBHOOK] User tidak ditemukan:', order.email);
        return res.status(404).end();
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 bulan, bisa diubah

      user.currentPackage = {
        packageId: order.paket,
        startDate,
        endDate,
        isActive: true
      };

      await user.save();

      console.log('[WEBHOOK] Berhasil update order dan user');
      return res.status(200).end('OK');
    }

    // Status bukan PAID
    return res.status(200).end('No action needed');
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return res.status(500).end('Internal Server Error');
  }
}
