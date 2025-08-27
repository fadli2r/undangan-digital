import UserLayout from "@/components/layouts/UserLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OnboardingPaket() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [pakets, setPakets] = useState([]);

  useEffect(() => {
    fetch("/api/packages/list") // pastikan endpoint ini benar-benar query DB
      .then(res => res.json())
      .then(data => setPakets(data.packages || []));
  }, []);

  const handleNext = async () => {
  if (!selected) return alert("Pilih paket dulu!");

  // Simpan sementara ke localStorage agar bisa dipakai di /data
  localStorage.setItem(
    "onboardingData",
    JSON.stringify({ packageId: selected })
  );

  await fetch("/api/onboarding/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step: 2, packageId: selected }),
  });

  router.push("/onboarding/data");
};


  return (
    <UserLayout>
      <div className="container py-10">
        <h2 className="mb-6">Pilih Paket</h2>
        <div className="row g-4">
          {pakets.length === 0 && (
            <div className="col-12 text-center text-muted">Tidak ada paket tersedia</div>
          )}
          {pakets.map((p) => (
            <div key={p._id} className="col-md-4">
              <div
                className={`card cursor-pointer h-100 ${selected === p._id ? 'border-primary' : ''}`}
                onClick={() => setSelected(p._id)}
              >
                <div className="card-body">
                  {p.isPopular && (
                    <div className="mb-2">
                      <span className="badge bg-success">{p.metadata?.badge || "Populer"}</span>
                    </div>
                  )}
                  <h5>{p.name}</h5>
                  <p className="text-muted">{p.description}</p>
                  <strong>
                    Rp {p.price?.toLocaleString("id-ID")}
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-muted text-decoration-line-through ms-2">
                        Rp {p.originalPrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </strong>
                  <ul className="mt-3">
                    {p.features?.slice(0, 3).map((f, idx) => (
                      <li key={idx} className="small">
                        ✅ {f.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={handleNext}
            className="btn btn-primary"
            disabled={!selected}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
