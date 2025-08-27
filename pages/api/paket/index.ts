import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Package from '../../../models/Package';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const packages = await Package.find({});
    res.status(200).json(packages);
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
