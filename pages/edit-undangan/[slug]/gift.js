import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

// --- KOMONEN DAFTAR GIFT CONFIRMATION ---
function GiftConfirmationList({ slug }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/gift-list?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setList(data.list || []);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="text-center py-10">
        <i className="ki-duotone ki-gift fs-3x text-muted mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
        <div className="text-muted fs-6">Belum ada konfirmasi gift masuk</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3 className="fw-bold">Daftar Gift Confirmation</h3>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 gy-7">
            <thead>
              <tr className="fw-bold fs-6 text-gray-800">
                <th>Nama</th>
                <th>Metode</th>
                <th>Nominal</th>
                <th>Pesan</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {list.map((gift, idx) => (
                <tr key={idx}>
                  <td className="fw-bold">{gift.nama}</td>
                  <td>{gift.bank}</td>
                  <td>Rp{Number(gift.nominal).toLocaleString()}</td>
                  <td>{gift.pesan || "-"}</td>
                  <td>{new Date(gift.waktu).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
                <div className="mb-8">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <h3 className="fw-bold">Rekening Bank</h3>
                    <button
                      type="button"
                      onClick={addBankAccount}
                      className="btn btn-light-primary btn-sm"
                    >
                      <i className="ki-duotone ki-plus fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Tambah Rekening
                    </button>
                  </div>

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
                    <div key={i} className="card card-flush shadow-sm mb-5">
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">Nama Bank</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Contoh: BCA, Mandiri, BNI"
                            value={acc.bank}
                            onChange={e => updateBankAccount(i, "bank", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label required">Nomor Rekening</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Masukkan nomor rekening"
                            value={acc.nomor}
                            onChange={e => updateBankAccount(i, "nomor", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label required">Atas Nama</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nama pemilik rekening"
                            value={acc.atas_nama}
                            onChange={e => updateBankAccount(i, "atas_nama", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label">URL Logo (opsional)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="URL logo bank"
                            value={acc.logo}
                            onChange={e => updateBankAccount(i, "logo", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBankAccount(i)}
                          className="btn btn-light-danger"
                        >
                          <i className="ki-duotone ki-trash fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </i>
                          Hapus Rekening
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* E-Wallets */}
                <div className="mb-8">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <h3 className="fw-bold">E-Wallet</h3>
                    <button
                      type="button"
                      onClick={addEWallet}
                      className="btn btn-light-primary btn-sm"
                    >
                      <i className="ki-duotone ki-plus fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Tambah E-Wallet
                    </button>
                  </div>

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
                    <div key={i} className="card card-flush shadow-sm mb-5">
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">Nama E-Wallet</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Contoh: GoPay, OVO, DANA"
                            value={ew.nama}
                            onChange={e => updateEWallet(i, "nama", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label required">Nomor/Username</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nomor HP atau username"
                            value={ew.nomor}
                            onChange={e => updateEWallet(i, "nomor", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label">URL QR Code (opsional)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="URL QR Code e-wallet"
                            value={ew.qr_code}
                            onChange={e => updateEWallet(i, "qr_code", e.target.value)}
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label">URL Logo (opsional)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="URL logo e-wallet"
                            value={ew.logo}
                            onChange={e => updateEWallet(i, "logo", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEWallet(i)}
                          className="btn btn-light-danger"
                        >
                          <i className="ki-duotone ki-trash fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </i>
                          Hapus E-Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* QRIS */}
                <div className="mb-8">
                  <h3 className="fw-bold mb-5">QRIS</h3>
                  <div className="mb-5">
                    <label className="form-check form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={gift.qris.enabled}
                        onChange={e => updateQRIS("enabled", e.target.checked)}
                      />
                      <span className="form-check-label fw-semibold">
                        Aktifkan QRIS
                      </span>
                    </label>
                  </div>

                  {gift.qris.enabled && (
                    <div className="card card-flush shadow-sm">
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">URL Gambar QRIS</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="URL gambar QRIS"
                            value={gift.qris.image_url}
                            onChange={e => updateQRIS("image_url", e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label required">Nama Merchant</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nama merchant QRIS"
                            value={gift.qris.merchant_name}
                            onChange={e => updateQRIS("merchant_name", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
