import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
// ----- REPLACE komponen GiftConfirmationList lama kamu dengan ini -----

function GiftConfirmationList({ slug }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fmtIDR = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("id-ID", { hour12: false }) : "-";

  useEffect(() => {
    if (!slug) return;
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/invitation/gift-list?slug=${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (!aborted) setList(Array.isArray(data.list) ? data.list : []);
      } catch {
        if (!aborted) setList([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [slug]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((g) =>
      [g?.nama, g?.bank, g?.pesan].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [q, list]);

  return (
    <div className="card">
      {/* begin::Card header */}
      <div className="card-header">
        <div className="card-title">
          <h3 className="fw-bold">Daftar Gift Confirmation</h3>
        </div>

        {/* begin::Toolbar (Search) */}
        <div className="card-toolbar">
          <div className="d-flex align-items-center position-relative my-1">
            <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <input
              type="text"
              className="form-control form-control-solid w-250px ps-13"
              placeholder="Cari nama/bank/pesan..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        {/* end::Toolbar */}
      </div>
      {/* end::Card header */}

      {/* begin::Card body */}
      <div className="card-body pt-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-10">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <i className="ki-duotone ki-gift fs-3x text-muted mb-3">
              <span className="path1" />
              <span className="path2" />
              <span className="path3" />
            </i>
            <div className="text-muted fs-6">
              {q ? "Tidak ada hasil untuk pencarian." : "Belum ada konfirmasi gift masuk"}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fw-semibold fs-6 gy-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Nama</th>
                  <th>Metode</th>
                  <th>Nominal</th>
                  <th>Pesan</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filtered.map((g, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{g?.nama || "-"}</td>
                    <td>{g?.bank || g?.metode || "-"}</td>
                    <td>{fmtIDR(g?.nominal)}</td>
                    <td className="text-break">{g?.pesan || "-"}</td>
                    <td>{fmtDate(g?.waktu)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* end::Card body */}
    </div>
  );
}
export { GiftConfirmationList };


export default function Gift() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState({
    enabled: false,
    bank_accounts: [],
    e_wallets: [],
    qris: {
      enabled: false,
      image_url: "",
      merchant_name: ""
    }
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch gift data
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.undangan?.gift) {
          setGift(res.undangan.gift);
        }
        setLoading(false);
      });
  }, [slug]);

  // Handlers for inputs
  const handleChange = (field, value) => {
    setGift(prev => ({ ...prev, [field]: value }));
  };

  const updateBankAccount = (index, field, value) => {
    setGift(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.map((acc, i) =>
        i === index ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const updateEWallet = (index, field, value) => {
    setGift(prev => ({
      ...prev,
      e_wallets: prev.e_wallets.map((ew, i) =>
        i === index ? { ...ew, [field]: value } : ew
      )
    }));
  };

  const updateQRIS = (field, value) => {
    setGift(prev => ({
      ...prev,
      qris: { ...prev.qris, [field]: value }
    }));
  };

  const addBankAccount = () => {
    setGift(prev => ({
      ...prev,
      bank_accounts: [...prev.bank_accounts, { bank: "", nomor: "", atas_nama: "", logo: "" }]
    }));
  };

  const removeBankAccount = (index) => {
    setGift(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.filter((_, i) => i !== index)
    }));
  };

  const addEWallet = () => {
    setGift(prev => ({
      ...prev,
      e_wallets: [...prev.e_wallets, { nama: "", nomor: "", qr_code: "", logo: "" }]
    }));
  };

  const removeEWallet = (index) => {
    setGift(prev => ({
      ...prev,
      e_wallets: prev.e_wallets.filter((_, i) => i !== index)
    }));
  };

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const updates = {
        gift: gift
      };

      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          field: updates
        }),
      });

      const result = await res.json();

      setLoading(false);
      if (res.ok) {
        setSuccess("Pengaturan amplop digital berhasil disimpan!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(`Gagal menyimpan data: ${result.message || "Coba lagi"}`);
      }
    } catch (err) {
      setLoading(false);
      setError("Gagal menyimpan data: " + err.message);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <BackButton />
      <div className="card mb-8">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Pengaturan Amplop Digital</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="form-check form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={gift.enabled}
                  onChange={e => handleChange("enabled", e.target.checked)}
                />
                <span className="form-check-label fw-semibold">
                  Aktifkan Amplop Digital
                </span>
              </label>
            </div>

            {gift.enabled && (
              <>
                {/* Bank Accounts */}
{/* Rekening Bank */}
<div className="card card-flush mb-8">
  <div className="card-header d-flex justify-content-between align-items-center">
    <h3 className="fw-bold mb-0">Rekening Bank</h3>
    <button
      type="button"
      onClick={addBankAccount}
      className="btn btn-sm btn-light-primary"
    >
      <i className="ki-duotone ki-plus fs-2 me-1">
        <span className="path1"></span>
        <span className="path2"></span>
      </i>
      Tambah Rekening
    </button>
  </div>

  <div className="card-body">
    {gift.bank_accounts.length === 0 && (
      <div className="text-center py-10">
        <i className="ki-duotone ki-bank fs-3x text-muted mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <div className="text-muted fs-6">Belum ada rekening bank</div>
      </div>
    )}

    {gift.bank_accounts.map((acc, i) => (
      <div key={i} className="border rounded p-5 mb-5 border-dashed">
        <div className="row">
          <div className="col-md-6 mb-5">
            <label className="form-label required">Nama Bank</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Contoh: BCA, Mandiri, BNI"
              value={acc.bank}
              onChange={e => updateBankAccount(i, "bank", e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label required">Nomor Rekening</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Masukkan nomor rekening"
              value={acc.nomor}
              onChange={e => updateBankAccount(i, "nomor", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-5">
            <label className="form-label required">Atas Nama</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Nama pemilik rekening"
              value={acc.atas_nama}
              onChange={e => updateBankAccount(i, "atas_nama", e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label">URL Logo (opsional)</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="URL logo bank"
              value={acc.logo}
              onChange={e => updateBankAccount(i, "logo", e.target.value)}
            />
          </div>
        </div>
        <div className="text-end">
          <button
            type="button"
            onClick={() => removeBankAccount(i)}
            className="btn btn-light-danger btn-sm"
          >
            <i className="ki-duotone ki-trash fs-3 me-1">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Hapus Rekening
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

{/* E-Wallet */}
<div className="card card-flush mb-8">
  <div className="card-header d-flex justify-content-between align-items-center">
    <h3 className="fw-bold mb-0">E-Wallet</h3>
    <button
      type="button"
      onClick={addEWallet}
      className="btn btn-sm btn-light-primary"
    >
      <i className="ki-duotone ki-plus fs-2 me-1">
        <span className="path1"></span>
        <span className="path2"></span>
      </i>
      Tambah E-Wallet
    </button>
  </div>

  <div className="card-body">
    {gift.e_wallets.length === 0 && (
      <div className="text-center py-10">
        <i className="ki-duotone ki-wallet fs-3x text-muted mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <div className="text-muted fs-6">Belum ada e-wallet</div>
      </div>
    )}

    {gift.e_wallets.map((ew, i) => (
      <div key={i} className="border rounded p-5 mb-5 border-dashed">
        <div className="row">
          <div className="col-md-6 mb-5">
            <label className="form-label required">Nama E-Wallet</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Contoh: GoPay, OVO, DANA"
              value={ew.nama}
              onChange={e => updateEWallet(i, "nama", e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label required">Nomor/Username</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Nomor HP atau username"
              value={ew.nomor}
              onChange={e => updateEWallet(i, "nomor", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-5">
            <label className="form-label">URL QR Code (opsional)</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="URL QR Code e-wallet"
              value={ew.qr_code}
              onChange={e => updateEWallet(i, "qr_code", e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label">URL Logo (opsional)</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="URL logo e-wallet"
              value={ew.logo}
              onChange={e => updateEWallet(i, "logo", e.target.value)}
            />
          </div>
        </div>
        <div className="text-end">
          <button
            type="button"
            onClick={() => removeEWallet(i)}
            className="btn btn-light-danger btn-sm"
          >
            <i className="ki-duotone ki-trash fs-3 me-1">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Hapus E-Wallet
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


                {/* QRIS */}
<div className="card card-flush mb-8">
  {/* begin::Card header */}
  <div className="card-header align-items-center">
    <div className="card-title">
      <h3 className="fw-bold mb-0">QRIS</h3>
    </div>

    {/* Toggle enable */}
    <div className="card-toolbar">
      <label className="form-check form-switch form-check-custom form-check-solid">
        <input
          className="form-check-input h-20px w-30px"
          type="checkbox"
          checked={gift.qris.enabled}
          onChange={(e) => updateQRIS("enabled", e.target.checked)}
        />
        <span className="form-check-label ms-3 fw-semibold">Aktifkan QRIS</span>
      </label>
    </div>
  </div>
  {/* end::Card header */}

  {/* begin::Card body */}
  <div className="card-body pt-0">
    {!gift.qris.enabled && (
      <div className="text-center py-10">
        <i className="ki-duotone ki-qr-code fs-3x text-muted mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <div className="text-muted fs-6">QRIS belum diaktifkan</div>
      </div>
    )}

    {gift.qris.enabled && (
      <div className="border rounded p-5 border-dashed">
        <div className="row">
          <div className="col-md-6 mb-5">
            <label className="form-label required">URL Gambar QRIS</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="https://…/qris.png"
              value={gift.qris.image_url}
              onChange={(e) => updateQRIS("image_url", e.target.value)}
              required
            />
            <div className="form-text">Tempel tautan gambar QRIS berformat PNG/JPG.</div>
          </div>

          <div className="col-md-6 mb-5">
            <label className="form-label required">Nama Merchant</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Nama merchant QRIS"
              value={gift.qris.merchant_name}
              onChange={(e) => updateQRIS("merchant_name", e.target.value)}
              required
            />
            <div className="form-text">Ditampilkan kepada tamu sebagai pemilik QRIS.</div>
          </div>
        </div>

        {/* Preview */}
        {gift.qris.image_url?.trim() && (
          <div className="mt-5">
            <label className="form-label">Pratinjau QRIS</label>
            <div className="d-flex align-items-center gap-5">
              <div className="border rounded p-3 bg-light d-inline-flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gift.qris.image_url}
                  alt="QRIS"
                  className="rounded"
                  style={{ width: 160, height: 160, objectFit: "contain" }}
                />
              </div>
              <div className="text-muted">
                Pastikan QR dapat dipindai dan terlihat jelas.
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  {/* end::Card body */}
</div>

              </>
            )}

            {success && (
              <div className="alert alert-success mb-5">
                <i className="ki-duotone ki-check-circle fs-2 me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mb-5">
                <i className="ki-duotone ki-cross-circle fs-2 me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>

      {/* DAFTAR KONFIRMASI GIFT */}
      <GiftConfirmationList slug={slug} />
    </UserLayout>
  );
}
