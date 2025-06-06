import dbConnect from '../../../utils/db';
import Invitation from '../../../models/Invitation';
import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    await dbConnect();
    
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ucapan & Doa');

    // Add headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Pesan', key: 'pesan', width: 50 },
      { header: 'Waktu', key: 'waktu', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    invitation.ucapan.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: item.nama,
        pesan: item.pesan,
        waktu: new Date(item.waktu).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { wrapText: true };
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ucapan-${slug}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);

    // Send Excel file
    res.send(buffer);

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ 
      error: 'Failed to generate Excel file',
      message: error.message 
    });
  }
}
