import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import Template from "../../../models/Template"; // pastikan model Template sudah ada

export default async function handler(req, res) {
  await dbConnect();

  try {
    // 1️⃣ ambil semua undangan
    const invitations = await Invitation.find(
      {},
      {
        slug: 1,
        mempelai: 1,
        acara_utama: 1,
        main_photo: 1,
        template: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // 2️⃣ ambil semua template yang relevan
    const templateSlugs = [
      ...new Set(invitations.map((i) => i.template).filter(Boolean)),
    ];
    const templates = await Template.find(
      { slug: { $in: templateSlugs } },
      { name: 1, slug: 1, thumbnail: 1 }
    ).lean();

    const templateMap = Object.fromEntries(
      templates.map((t) => [t.slug, t])
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3️⃣ bentuk data final
    const data = invitations.map((inv) => {
      const pria = inv?.mempelai?.pria || "Mempelai Pria";
      const wanita = inv?.mempelai?.wanita || "Mempelai Wanita";

      const tanggal = inv?.acara_utama?.tanggal
        ? new Date(inv.acara_utama.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      // ambil tema dari Template
      const tpl = templateMap[inv.template] || null;
      const tema = tpl?.name || inv.template || "Tema Elegan";
      const thumbnail =
        inv.main_photo ||
        tpl?.thumbnail ||
        `${baseUrl}/images/bg_couple.jpg`;

      return {
        id: inv._id.toString(),
        slug: inv.slug,
        name: `${pria} & ${wanita}`,
        tema,
        tanggal,
        thumbnail,
      };
    });

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error load portofolio:", err);
    res.status(500).json({ ok: false, message: "Gagal memuat portofolio" });
  }
}
