import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

  if (loading) return <div>Memuat daftar konfirmasi gift...</div>;
  if (!list.length) return <div className="mt-8 text-gray-500">Belum ada konfirmasi gift masuk.</div>;

  return (
    <div className="mt-10 max-w-xl mx-auto">
      <h3 className="font-bold mb-4 text-lg">Daftar Gift Confirmation</h3>
      <ul className="divide-y">
        {list.map((gift, idx) => (
          <li key={idx} className="py-3">
            <div className="font-semibold">{gift.nama}</div>
            <div>Metode: <b>{gift.bank}</b></div>
            <div>Nominal: <b>Rp{Number(gift.nominal).toLocaleString()}</b></div>
            {gift.pesan && <div className="italic text-gray-500">Pesan: {gift.pesan}</div>}
            <div className="text-xs text-gray-400">{new Date(gift.waktu).toLocaleString()}</div>
          </li>
        ))}
      </ul>
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Pengaturan Amplop Digital</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gift.enabled}
              onChange={e => handleChange("enabled", e.target.checked)}
            />
            <span>Aktifkan Amplop Digital</span>
          </label>
        </div>

        {gift.enabled && (
          <>
            {/* Bank Accounts */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Rekening Bank</h3>
                <button
                  type="button"
                  onClick={addBankAccount}
                  className="text-blue-600 hover:underline"
                >
                  Tambah Rekening
                </button>
              </div>
              {gift.bank_accounts.length === 0 && <p className="text-gray-500 mb-2">Belum ada rekening.</p>}
              {gift.bank_accounts.map((acc, i) => (
                <div key={i} className="mb-4 border p-3 rounded">
                  <input
                    type="text"
                    placeholder="Nama Bank"
                    value={acc.bank}
                    onChange={e => updateBankAccount(i, "bank", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={acc.nomor}
                    onChange={e => updateBankAccount(i, "nomor", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Atas Nama"
                    value={acc.atas_nama}
                    onChange={e => updateBankAccount(i, "atas_nama", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="URL Logo (opsional)"
                    value={acc.logo}
                    onChange={e => updateBankAccount(i, "logo", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeBankAccount(i)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus Rekening
                  </button>
                </div>
              ))}
            </div>

            {/* E-Wallets */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">E-Wallet</h3>
                <button
                  type="button"
                  onClick={addEWallet}
                  className="text-blue-600 hover:underline"
                >
                  Tambah E-Wallet
                </button>
              </div>
              {gift.e_wallets.length === 0 && <p className="text-gray-500 mb-2">Belum ada e-wallet.</p>}
              {gift.e_wallets.map((ew, i) => (
                <div key={i} className="mb-4 border p-3 rounded">
                  <input
                    type="text"
                    placeholder="Nama E-Wallet"
                    value={ew.nama}
                    onChange={e => updateEWallet(i, "nama", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Nomor/Username"
                    value={ew.nomor}
                    onChange={e => updateEWallet(i, "nomor", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="URL QR Code (opsional)"
                    value={ew.qr_code}
                    onChange={e => updateEWallet(i, "qr_code", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="URL Logo (opsional)"
                    value={ew.logo}
                    onChange={e => updateEWallet(i, "logo", e.target.value)}
                    className="w-full mb-1 border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeEWallet(i)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus E-Wallet
                  </button>
                </div>
              ))}
            </div>

            {/* QRIS */}
            <div>
              <h3 className="font-semibold mb-2">QRIS</h3>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={gift.qris.enabled}
                  onChange={e => updateQRIS("enabled", e.target.checked)}
                />
                <span>Aktifkan QRIS</span>
              </label>
              {gift.qris.enabled && (
                <>
                  <input
                    type="text"
                    placeholder="URL Gambar QRIS"
                    value={gift.qris.image_url}
                    onChange={e => updateQRIS("image_url", e.target.value)}
                    className="w-full mb-2 border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Nama Merchant"
                    value={gift.qris.merchant_name}
                    onChange={e => updateQRIS("merchant_name", e.target.value)}
                    className="w-full mb-2 border rounded px-2 py-1"
                  />
                </>
              )}
            </div>
          </>
        )}

        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      {/* DAFTAR KONFIRMASI GIFT */}
      <GiftConfirmationList slug={slug} />
    </div>
  );
}
