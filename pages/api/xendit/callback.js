import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const event = req.body;
  await dbConnect();

  const { id: invoiceId, status } = event;

  const order = await Order.findOne({ xenditInvoiceId: invoiceId });
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  if (status === "PAID") {
    order.paidAt = new Date();

    // activate package to user
    const user = await User.findById(order.userId);
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1); // contoh: aktif 1 bulan

    user.currentPackage = {
      packageId: order.packageId,
      startDate: start,
      endDate: end,
      isActive: true
    };

    await user.save();
  }

  await order.save();
  res.status(200).json({ message: "Success" });
}
