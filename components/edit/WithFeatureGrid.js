// components/edit/withFeatureGate.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '../layouts/UserLayout'; // sesuaikan path jika berbeda

export default function withFeatureGate(featureKey) {
  return function Gate(Wrapped) {
    return function FeatureGatedPage(props) {
      const router = useRouter();
      const { slug } = router.query;
      const [loading, setLoading] = useState(true);
      const [inv, setInv] = useState(null);
      const [error, setError] = useState('');

      useEffect(() => {
        if (!slug) return;
        setLoading(true);
        fetch(`/api/invitation/detail?slug=${slug}`)
          .then(r => r.json())
          .then(d => {
            if (!d?.undangan) throw new Error(d?.message || 'Undangan tidak ditemukan');
            setInv(d.undangan);
          })
          .catch(e => setError(e.message))
          .finally(() => setLoading(false));
      }, [slug]);

      if (loading) {
        return (
          <UserLayout>
            <div className="d-flex justify-content-center py-20">
              <div className="spinner-border text-primary" role="status" />
            </div>
          </UserLayout>
        );
      }

      if (error) {
        return (
          <UserLayout>
            <div className="alert alert-danger my-10">{error}</div>
          </UserLayout>
        );
      }

      const enabled = Array.isArray(inv?.features) && inv.features.includes(featureKey);

      if (!enabled) {
        return (
          <UserLayout>
            <div className="card">
              <div className="card-body text-center py-20">
                <h3 className="fw-bold mb-3">Fitur Tidak Tersedia</h3>
                <p className="text-gray-600 mb-6">
                  Fitur <code>{featureKey}</code> belum termasuk dalam paket undangan kamu.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <button className="btn btn-light" onClick={() => router.push(`/edit-undangan/${slug}`)}>
                    Kembali
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => router.push(`/upgrade?slug=${slug}&feature=${featureKey}`)}
                  >
                    Upgrade Paket
                  </button>
                </div>
              </div>
            </div>
          </UserLayout>
        );
      }

      return <Wrapped {...props} invitation={inv} />;
    };
  };
}
