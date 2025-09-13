import Link from 'next/link';

const MENU = [
  { key:'mempelai',       title:'Informasi Mempelai', href:'/edit-undangan/[slug]/mempelai', badge:'❤️' },
  { key:'acara',          title:'Informasi Acara',    href:'/edit-undangan/[slug]/acara',    badge:'📅' },
  { key:'galeri',         title:'Galeri',             href:'/edit-undangan/[slug]/galeri',   badge:'🖼️' },
  { key:'gift',           title:'Amplop Digital',     href:'/edit-undangan/[slug]/gift',     badge:'🎁' },
  { key:'rsvp',           title:'RSVP',               href:'/edit-undangan/[slug]/rsvp',     badge:'✅' },
  { key:'ourStory',       title:'Our Story',          href:'/edit-undangan/[slug]/ourstory',badge:'📖' },
  { key:'ucapan',         title:'Ucapan',             href:'/edit-undangan/[slug]/ucapan',   badge:'💬' },
  { key:'privacy',        title:'Pengaturan Privasi', href:'/edit-undangan/[slug]/privacy',  badge:'🔒' },
  { key:'downloadExport', title:'Download & Export',  href:'/edit-undangan/[slug]/export',   badge:'⬇️' },
];

export default function EditMenuGrid({ invitation, onUpgrade }) {
  const { slug, features = [] } = invitation || {};

  return (
    <div className="row g-6">
      {MENU.map(m => {
        const enabled = features.includes(m.key);
        return (
          <div className="col-md-4" key={m.key}>
            <div className={`card shadow-sm ${enabled ? '' : 'opacity-50'}`}>
              <div className="card-body text-center">
                <div className="fs-1 mb-3">{m.badge}</div>
                <h5 className="mb-2">{m.title}</h5>
                {enabled ? (
                  <Link href={m.href.replace('[slug]', slug)} className="btn btn-primary">
                    Kelola
                  </Link>
                ) : (
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-secondary" disabled>
                      Tidak tersedia
                    </button>
                    {onUpgrade && (
                      <button className="btn btn-success" onClick={() => onUpgrade(m.key)}>
                        Upgrade
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
