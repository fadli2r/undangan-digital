export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For testing, just return success since token is handled client-side
  return res.status(200).json({ success: true });
}
