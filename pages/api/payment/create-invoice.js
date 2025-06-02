import axios from "axios";
import dbConnect from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { paket, email, name } = req.body;
  const paketInfo = {
    basic: { harga: 25000, nama: "Basic" },
    premium: { harga: 50000, nama: "Premium" }
  }[paket];

  if (!paketInfo) return res.status(400).json({ message: "Paket tidak valid" });
  if (!email) return res.status(400).json({ message: "Email tidak ditemukan" });

  console.log("Create invoice untuk:", email, name, paket);

  try {
    const resp = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id: `${email}-${Date.now()}`,
        payer_email: email,
        description: `Pembelian Paket Undangan: ${paketInfo.nama}`,
        amount: paketInfo.harga,
        success_redirect_url: "http://localhost:3000/dashboard",
      },
      {
        auth: {
          username: process.env.XENDIT_SECRET_KEY,
          password: "",
        }
      }
    );

    // Tambahkan log sebelum dan sesudah update DB
    await dbConnect();
    console.log("CONNECTED TO DB");

    const result = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name || "",
          paket,
          status_pembayaran: "pending",
          invoice_id: resp.data.id,
        }
      },
      { upsert: true, new: true }
    );
    console.log("USER UPDATED/CREATED:", result);

    res.status(200).json({ invoice_url: resp.data.invoice_url, invoice_id: resp.data.id });
  } catch (error) {
    console.error("Error create-invoice:", error.response?.data || error.message);
    res.status(500).json({ message: "Gagal membuat invoice" });
  }
}
