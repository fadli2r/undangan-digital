// pages/api/payment/xendit-webhook.js
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import User from '../../../models/User';

export const config = { api: { bodyParser: true } };

function safeParse(v) {
  if (typeof v !== 'string') return v || {};
  try { return JSON.parse(v); } catch { return {}; }
}
const up = (s) => String(s || '').toUpperCase();

function normalize(req) {
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  return {
    body,
    status: up(body.status || body.data?.status),             // e.g. PAID / SETTLED / EXPIRED / PENDING
    id: body.id || body.data?.id,
    external_id: body.external_id || body.data?.external_id,
    paid_at: body.paid_at || body.data?.paid_at
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Header token: Next.js menurunkan ke lowercase, tapi sediakan fallback
  const token = req.headers['x-callback-token'] || req.headers['X-CALLBACK-TOKEN'];
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  console.log('WEBHOOK TOKEN', { received: token, expected: expected ? '[set]' : '[missing]' });
  if (!token || token !== expected) {
    console.error('WEBHOOK 401 - Invalid token');
    return res.status(401).json({ error: 'Invalid callback token' });
  }

  await dbConnect();

  const { body, status, id, external_id, paid_at } = normalize(req);

  // Logging penting untuk debug
  console.log('WEBHOOK HIT', {
    status, id, external_id, time: new Date().toISOString()
  });
  console.log('WEBHOOK BODY', body);

  if (!external_id) {
    console.error('WEBHOOK 400 - Missing external_id');
    return res.status(400).json({ error: 'Missing external_id' });
  }

  const order = await Order.findOne({ external_id });
  if (!order) {
    console.error('WEBHOOK 404 - Order not found', { external_id });
    return res.status(404).json({ error: 'Order not found' });
  }

  try {
    if (status === 'PAID' || status === 'SETTLED') {
      const wasPaid = order.status === 'paid';

      order.status = 'paid';
      order.invoice_id = id || order.invoice_id;
      // pakai paid_at dari payload kalau ada
      order.paid_at = order.paid_at || (paid_at ? new Date(paid_at) : new Date());
      await order.save();

      if (!wasPaid) {
        // tandai onboarding selesai + tambah quota 1x
        const upd = await User.updateOne(
          { email: order.email },
          { $set: { onboardingCompleted: true }, $inc: { quota: 1 } },
          { upsert: true }
        );
        console.log('WEBHOOK quota+1 result:', upd); // matchedCount / modifiedCount untuk verifikasi
      }

    } else if (status === 'EXPIRED') {
      order.status = 'expired';
      await order.save();

    } else if (status === 'PENDING') {
      // no-op

    } else if (['FAILED', 'PAID_FAILED', 'CANCELED', 'CANCELLED'].includes(status)) {
      order.status = 'cancelled';
      await order.save();

    } else {
      console.warn('WEBHOOK - Unknown status:', status);
    }

    // balas cepat agar Xendit anggap sukses
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('WEBHOOK 500 - Error:', e?.message || e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
