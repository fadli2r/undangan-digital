import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { slug, field } = req.body;
  if (!slug || !field) return res.status(400).json({ message: "Data tidak lengkap" });

  console.log('Updating invitation:', { slug, field });  // Debug log

  await dbConnect();
  try {
    // Get current document
    const current = await Invitation.findOne({ slug });
    console.log('Current document:', current);  // Debug log

    // Handle nested field updates
    const updateFields = {};
    
    // Flatten the field object for MongoDB update
    Object.keys(field).forEach(key => {
      if (typeof field[key] === 'object' && field[key] !== null && !Array.isArray(field[key])) {
        // Handle nested objects like mempelai and tambahan
        Object.keys(field[key]).forEach(nestedKey => {
          updateFields[`${key}.${nestedKey}`] = field[key][nestedKey];
        });
      } else {
        updateFields[key] = field[key];
      }
    });

    const updated = await Invitation.findOneAndUpdate(
      { slug },
      { 
        $set: updateFields,
        $currentDate: { updatedAt: true }
      },
      { new: true }
    );
    console.log('Updated document:', updated);  // Debug log

    if (!updated) return res.status(404).json({ message: "Undangan tidak ditemukan" });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message || "Gagal update undangan" });
  }
}
