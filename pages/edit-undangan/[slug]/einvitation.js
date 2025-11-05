import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function EInvitationSettings() {
  const router = useRouter();
  const { slug } = router.query;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/e-invitation/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data || {});
        setLoading(false);
      });
  }, [slug]);

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("cover", file);

    try {
      const res = await fetch("/api/invitation/e-invitation/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateForm("coverImage", data.path);
      } else {
        alert("❌ Gagal upload gambar");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("❌ Upload error");
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    await fetch(`/api/invitation/e-invitation/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("✅ Setting berhasil disimpan!");
  };

  if (loading || !form) {
    return (
      <UserLayout>
        <div className="p-6">Loading...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <BackButton />

      <div className="row g-10">
        {/* FORM EDITOR */}
        <div className="col-md-6">
          <div className="card p-6">
            <h3 className="mb-4">E-Invitation Settings</h3>

            {/* Cover Image */}
            <div className="mb-3">
              <label className="form-label">Cover Image</label>
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="cover"
                  className="w-100 rounded mb-2"
                  style={{ maxHeight: "180px", objectFit: "cover" }}
                />
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files[0])}
              />
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={form.title || ""}
                onChange={(e) => updateForm("title", e.target.value)}
              />
            </div>

            {/* Top & Bottom Text */}
            <div className="row text-center">
              <div className="col-md-6 mb-3">
                <label className="form-label">Top Text</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={form.topText || ""}
                  onChange={(e) => updateForm("topText", e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Bottom Text</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={form.bottomText || ""}
                  onChange={(e) => updateForm("bottomText", e.target.value)}
                />
              </div>
            </div>

            {/* Greeting */}
            <div className="mb-3">
              <label className="form-label">Greeting</label>
              <input
                type="text"
                className="form-control text-center"
                value={form.greeting || ""}
                onChange={(e) => updateForm("greeting", e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="form-label">Message Text</label>
              <textarea
                className="form-control text-center"
                rows={3}
                value={form.messageText || ""}
                onChange={(e) => updateForm("messageText", e.target.value)}
              />
            </div>

            {/* Toggles */}
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form.showQRCode || false}
                onChange={(e) => updateForm("showQRCode", e.target.checked)}
              />
              <label className="form-check-label">Show QR Code</label>
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form.showLink || false}
                onChange={(e) => updateForm("showLink", e.target.checked)}
              />
              <label className="form-check-label">Show e-Invitation Link</label>
            </div>

            <button className="btn btn-primary mt-4" onClick={saveSettings}>
              Simpan
            </button>
          </div>
        </div>

        {/* PREVIEW */}
<div className="col-md-6 preview-col">
  <h4 className="preview-title mb-3">Preview</h4>
            <div className="invitation-card">
            <header
              className="header"
              style={{
                background: form.coverImage
                  ? `url(${form.coverImage}) center/cover no-repeat`
                  : "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              }}
            >
              <div className="header-content">
                {form.topText && <div className="top-text">{form.topText}</div>}
                <h1>{form.title || "LINA & DINA"}</h1>
                {form.bottomText && (
                  <div className="bottom-text">{form.bottomText}</div>
                )}
              </div>
            </header>

            <main className="body">
              <section className="reception">
                <h2>Resepsi</h2>
                <div className="reception-details">
                  <span>📅</span>
                  <p>
                    Friday, October 31<sup>st</sup>, 2025
                    <br />
                    11:00 - 13:00
                  </p>
                </div>
              </section>

              <section className="guest-qr-section">
                <div className="guest-info">
                  <p className="label">{form.greeting || "TO"}</p>
                  <p className="name">John Doe</p>
                  <p className="instructions">
                    {form.messageText ||
                      "You are invited to our wedding day! Bring this card and scan the QR code for check-in at location."}
                  </p>
                </div>
                {form.showQRCode && (
                  <img
                    className="qr-code"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      form.title || "Wedding Invitation"
                    )}`}
                    alt="QR"
                  />
                )}
              </section>
            </main>

           {/* Footer */}
<footer className="footer">
  <div className="more-info">
    {form.showLink && (
      <>
        <p className="label">MORE INFO</p>
        <a href="#">
          {`${process.env.NEXT_PUBLIC_BASE_URL || "https://demo.com"}/${slug}`}
        </a>
      </>
    )}
  </div>
  <div className="powered-by">
    Powered by{" "}
    <span className="logo-icon">
      ❤<span>❤</span>
    </span>
    <span className="logo-text">Dreamslink</span>
  </div>
</footer>


          </div>
        </div>
      </div>

      <style jsx>{`
        .invitation-card {
          max-width: 380px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
          .preview-col {
  display: flex;
  flex-direction: column;
  align-items: center; /* biar card di tengah */
  justify-content: flex-start;
  text-align: center;
}

.preview-title {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 15px;
}
  .preview-col .invitation-card {
  text-align: left; /* isi card balik normal */
}
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 50px 20px;
          text-align: center;
          background-size: cover;
          background-position: center;
          min-height: 220px;
        }
        .header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .header h1 {
          margin: 0;
          font-size: 2.2em;
          font-weight: 700;
          letter-spacing: 1px;
          color: #fff;
        }
        .top-text,
        .bottom-text {
          font-size: 1em;
          font-weight: 400;
          color: #fff;
        }
        .body {
          padding: 25px 30px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .reception h2 {
          font-size: 0.9em;
          font-weight: 500;
          color: #888;
          margin: 0 0 10px 0;
          text-transform: uppercase;
        }
        .reception-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reception-details p {
          margin: 0;
          font-size: 1.1em;
          font-weight: 600;
          color: #333;
        }
        .guest-qr-section {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }
        .guest-info {
          flex: 1;
        }
        .guest-info .label {
          font-size: 0.8em;
          font-weight: 500;
          color: #888;
        }
        .guest-info .name {
          font-size: 1.2em;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
        }
        .instructions {
          font-size: 0.9em;
          color: #666;
        }
        .qr-code {
          width: 100px;
          height: 100px;
        }
        .footer {
  border-top: 1px solid #eee;
  padding-top: 20px;
  display: flex;
    padding: 10px 20px; /* ⬅️ tambah padding kiri-kanan */
  box-sizing: border-box; /* biar padding tetap dihitung */

  justify-content: space-between; /* kiri-kanan */
  align-items: center;
  font-size: 0.8em;
  width: 100%;
}

.more-info {
  text-align: left;
}

.more-info .label {
  font-weight: 500;
  color: #888;
  margin-bottom: 2px;
}

.more-info a {
  color: #1e3a8a;
  font-weight: 600;
  text-decoration: none;
}

.powered-by {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
}

.powered-by .logo-text {
  font-weight: 600;
  color: #555;
}

      `}</style>
    </UserLayout>
  );
}
