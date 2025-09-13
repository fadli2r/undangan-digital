// pages/onboarding/index.js
import UserLayout from "../../components/layouts/UserLayout";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function OnboardingPaket() {
  const router = useRouter();
  const [pakets, setPakets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/packages/list");
        const json = await res.json();
        setPakets(json.packages || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = useMemo(
    () => pakets.find((p) => p._id === selectedId) || null,
    [pakets, selectedId]
  );

  const handleSelect = (id) => setSelectedId(id);

  const handleNext = async () => {
    if (!selectedId) return alert("Pilih paket dulu!");
    localStorage.setItem("onboardingData", JSON.stringify({ packageId: selectedId }));
    try {
      await fetch("/api/onboarding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 2, packageId: selectedId }),
      });
    } catch {}
    router.push("/onboarding/data");
  };

  const formatIDR = (n) =>
    typeof n === "number"
      ? n.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
      : "-";

  return (
    <UserLayout>
      {/* Content */}

          {/* Stepper Horizontal */}
          <OnboardingStepper current="package" />

          {/* Pricing card ala Metronic */}
          <div className="card" id="kt_pricing">
            <div className="card-body p-lg-17">
              {/* Heading */}
              <div className="mb-13 text-center">
                <h1 className="fs-2hx fw-bold mb-5">Pilih Paket</h1>
                <div className="text-gray-600 fw-semibold fs-5">
                  Tentukan paket undangan digital yang cocok buat kamu.
                </div>
              </div>

              {/* Grid Paket */}
              <div className="row g-10">
                {loading && (
                  <div className="col-12 text-center py-10">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                )}

                {!loading && pakets.length === 0 && (
                  <div className="col-12 text-center text-muted py-10">
                    Tidak ada paket tersedia
                  </div>
                )}

                {pakets.map((p) => {
                  const isActive = selectedId === p._id;
                  const hasStrike = p.originalPrice && p.originalPrice > p.price;

                  return (
                    <div key={p._id} className="col-xl-4">
                      <div className="d-flex h-100 align-items-center">
                        <div
                          role="button"
                          onClick={() => handleSelect(p._id)}
                          className={[
                            "w-100 d-flex flex-column flex-center rounded-3 py-15 px-10",
                            "bg-light bg-opacity-75",
                            isActive ? "border border-primary" : "",
                            "cursor-pointer",
                          ].join(" ")}
                        >
                          {/* Badge */}
                          {p.isPopular && (
                            <div className="mb-5">
                              <span className="badge badge-light-success fw-bold">
                                {p.metadata?.badge || "Paling Populer"}
                              </span>
                            </div>
                          )}

                          {/* Title / Desc / Price */}
                          <div className="mb-7 text-center">
                            <h3 className="text-gray-900 mb-2 fw-bolder">{p.name}</h3>
                            {p.description && (
                              <div className="text-gray-600 fw-semibold mb-5">{p.description}</div>
                            )}

                            <div className="text-center">
                              <span className="fs-3x fw-bold text-primary">
                                {formatIDR(p.price).replace("Rp", "").trim()}
                              </span>
                              <span className="fs-7 fw-semibold opacity-50 ms-1">/ Paket</span>
                            </div>

                            {hasStrike && (
                              <div className="mt-2">
                                <span className="text-muted text-decoration-line-through">
                                  {formatIDR(p.originalPrice)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Features */}
                          <div className="w-100 mb-10">
                            {(p.features || []).slice(0, 6).map((f, idx) => (
                              <div key={idx} className="d-flex align-items-center mb-5">
                                <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">
                                  {f?.name || f}
                                </span>
                                <i className="ki-duotone ki-check-circle fs-1 text-success">
                                  <span className="path1"></span><span className="path2"></span>
                                </i>
                              </div>
                            ))}
                          </div>

                          {/* Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(p._id);
                            }}
                            className={`btn btn-sm ${isActive ? "btn-primary" : "btn-light-primary"}`}
                          >
                            {isActive ? "Dipilih" : "Pilih Paket"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="text-center mt-10">
                <button
                  disabled={!selected}
                  onClick={handleNext}
                  className="btn btn-primary px-10"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
          {/* /Pricing card */}
    </UserLayout>
  );
}
