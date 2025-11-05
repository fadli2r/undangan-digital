// pages/api/invitation/attendance.js

import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

/**
 * GET /api/invitation/attendance?slug=...&status=present|absent|all&source=all|invited|manual&search=...&sort=time_desc|name_asc&page=1&limit=50&summaryOnly=false
 *
 * - status:
 *    - present  => hanya yang sudah check-in (dari attendance[])
 *    - absent   => undangan yang belum check-in (dihitung dari tamu[] - attendance[])
 *    - all      => gabungan present + absent
 * - source:
 *    - invited  => hanya yang dari daftar undangan (invited=true)
 *    - manual   => hanya yang entry manual (invited=false)
 *    - all      => keduanya
 * - sort:
 *    - time_desc (default) => present diurut timestamp terbaru; absent di akhir
 *    - name_asc            => urut alfabet nama
 * - summaryOnly:
 *    - true  => hanya kembalikan ringkasan (tanpa items)
 *    - false => kembalikan ringkasan + items (dengan pagination)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      slug,
      status = "all",
      source = "all",
      search = "",
      sort = "time_desc",
      page = "1",
      limit = "50",
      summaryOnly = "false",
    } = req.query;

    if (!slug) {
      return res.status(400).json({ message: "Missing slug" });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 50)); // guard
    const wantSummaryOnly = String(summaryOnly).toLowerCase() === "true";

    await dbConnect();
    const invitation = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    const tamu = Array.isArray(invitation.tamu) ? invitation.tamu : [];
    const attendanceRaw = Array.isArray(invitation.attendance) ? invitation.attendance : [];

    // Helper: normalisasi nama untuk key
    const norm = (s) => String(s || "").toLowerCase().trim();

    // Buat map tamu berdasarkan nama untuk lookup cepat (kontak, dll)
    const tamuMap = new Map();
    for (const t of tamu) {
      const key = norm(t.nama);
      if (!key) continue;
      tamuMap.set(key, t);
    }

    // Agregasi attendance kalau ada duplikat nama (jaga-jaga)
    const attMap = new Map(); // key: normalized name, value: merged record
    for (const a of attendanceRaw) {
      const key = norm(a.name);
      if (!key) continue;
      const prev = attMap.get(key);
      if (!prev) {
        attMap.set(key, {
          name: a.name,
          jumlah: Number(a.jumlah || 1),
          timestamp: a.timestamp ? new Date(a.timestamp) : null,
          photo: a.photo || null,
          invited: typeof a.invited === "boolean" ? a.invited : true, // default true kalau tidak ada
          manual_note: a.manual_note || "",
          kontak: a.kontak || "", // manual bisa simpan kontak di attendance
        });
      } else {
        // Merge (ambil timestamp terbaru, jumlah dijumlahkan)
        attMap.set(key, {
          ...prev,
          jumlah: Number(prev.jumlah || 0) + Number(a.jumlah || 1),
          timestamp:
            new Date(a.timestamp || 0) > new Date(prev.timestamp || 0)
              ? new Date(a.timestamp)
              : prev.timestamp,
          photo: a.photo || prev.photo || null,
          invited: typeof a.invited === "boolean" ? a.invited : prev.invited,
          manual_note: a.manual_note || prev.manual_note,
          kontak: a.kontak || prev.kontak || "",
        });
      }
    }

    // Present list (dari attendance)
    const presentList = Array.from(attMap.values()).map((p) => {
      const key = norm(p.name);
      const t = tamuMap.get(key) || null;
      return {
        name: p.name,
        kontak: p.kontak || (t?.kontak || ""),
        invited: p.invited, // true=undangan, false=manual
        status: "present",
        jumlah: Number(p.jumlah || 1),
        timestamp: p.timestamp ? new Date(p.timestamp) : null,
        photo: p.photo || null,
      };
    });

    // Absent list (tamu yang diundang namun belum hadir)
    const absentList = tamu
      .filter((t) => !attMap.has(norm(t.nama)))
      .map((t) => ({
        name: t.nama,
        kontak: t.kontak || "",
        invited: true, // absent hanya dari daftar undangan
        status: "absent",
        jumlah: 0,
        timestamp: null,
        photo: null,
      }));

    // Ringkasan
    const totalInvited = tamu.length;
    const uniquePresent = presentList.length; // unik by name
    const totalPresentPeople = presentList.reduce((s, x) => s + Number(x.jumlah || 1), 0);
    const totalAbsent = Math.max(0, totalInvited - uniquePresent);
    const manualPresentCount = presentList.filter((x) => x.invited === false).length;
    const manualPresentPeople = presentList
      .filter((x) => x.invited === false)
      .reduce((s, x) => s + Number(x.jumlah || 1), 0);

    const summary = {
      totalInvited,
      uniquePresent,
      totalPresentPeople,
      totalAbsent,
      manualPresentCount,
      manualPresentPeople,
    };

    if (wantSummaryOnly) {
      return res.status(200).json({ slug, summary, items: [], page: { page: 1, limit: 0, totalItems: 0, totalPages: 0 } });
    }

    // Gabung sesuai filter status
    let items = [];
    if (status === "present") items = presentList;
    else if (status === "absent") items = absentList;
    else items = [...presentList, ...absentList];

    // Filter source
    if (source === "invited") items = items.filter((x) => x.invited === true);
    else if (source === "manual") items = items.filter((x) => x.invited === false);

    // Search
    const q = norm(search);
    if (q) {
      items = items.filter(
        (x) => norm(x.name).includes(q) || norm(x.kontak).includes(q)
      );
    }

    // Sort
    if (sort === "name_asc") {
      items.sort((a, b) => a.name.localeCompare(b.name, "id"));
    } else {
      // time_desc (default): present (ada timestamp) dulu, urut terbaru; absent (timestamp null) di akhir
      items.sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        // present before absent
        if (ta === 0 && tb === 0) return a.name.localeCompare(b.name, "id");
        if (ta === 0) return 1;
        if (tb === 0) return -1;
        return tb - ta;
      });
    }

    // Pagination
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (pageNum - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return res.status(200).json({
      slug,
      summary,
      items: paged,
      page: { page: pageNum, limit: pageSize, totalItems, totalPages },
    });
  } catch (error) {
    console.error("API Error in /attendance:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
