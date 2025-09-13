// utils/xendit.js
const BASE = 'https://api.xendit.co';

function authHeader() {
  const key = process.env.XENDIT_SECRET_KEY || '';
  const b64 = Buffer.from(`${key}:`).toString('base64');
  return `Basic ${b64}`;
}

export async function createInvoice({
  external_id,
  amount,
  description,
  payer_email,
  success_redirect_url,
  failure_redirect_url,
  currency = 'IDR',
  items = [],
  invoice_duration = 3600, // 1 jam
}) {
  const res = await fetch(`${BASE}/v2/invoices`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id,
      amount,
      description,
      payer_email,
      currency,
      success_redirect_url,
      failure_redirect_url,
      items: items.map(i => ({
        name: i.name,
        quantity: i.qty || 1,
        price: i.unitPrice,
        category: i.type,
      })),
      invoice_duration,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Xendit: create invoice failed');
  return data; // { id, external_id, amount, invoice_url, status, expiry_date, ... }
}

export function verifyXenditCallback(req) {
  const token = req.headers['x-callback-token'] || req.headers['X-CALLBACK-TOKEN'];
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  return !!expected && token === expected;
}
