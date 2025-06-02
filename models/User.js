import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  paket: String,
  invoice_id: String,
  quota: { type: Number, default: 0 }, // <-- PASTIKAN default ada!
    status_pembayaran: { type: String, default: "pending" }


});

export default mongoose.models.User || mongoose.model("User", UserSchema);
