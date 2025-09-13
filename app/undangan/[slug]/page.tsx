// app/undangan/[slug]/page.tsx
import { notFound } from 'next/navigation';

// ✅ Sesuaikan alias/path berikut dengan project-mu
import dbConnect from '@/utils/db';            // atau '@/lib/dbConnect'
import Invitation from '@/models/Invitation';
import { templateComponentMap } from '@/data/templates';

// Client components (slot)
import AddToCalendar from '@/components/templates/AddToCalendar';
import QRCodeGuest from '@/components/templates/QRCodeGuest';
import RSVPForm from '@/components/templates/RSVPForm';
import WeddingWishes from '@/components/templates/WeddingWishes';

export const dynamic = 'force-dynamic'; // selalu SSR

// -------- Helpers --------
function serialize(obj: any) {
  if (!obj) return obj;
  const src = obj.toObject ? obj.toObject() : obj;
  const out: any = {};
  for (const k of Object.keys(src)) {
    const v = (src as any)[k];
    if (v instanceof Date) out[k] = v.toISOString();
    else if (Array.isArray(v)) out[k] = v.map((it) => (it && typeof it === 'object' ? serialize(it) : it));
    else if (v && typeof v === 'object') out[k] = v._id ? { ...serialize(v), _id: String(v._id) } : serialize(v);
    else out[k] = v;
  }
  if ((src as any)._id) out._id = String((src as any)._id);
  return out;
}

export default async function Page(props: any) {
  // ⬇️ In Next terbaru, params & searchParams bisa berupa Promise → await dulu
  const params = await props.params;
  const searchParams = await props.searchParams;

  await dbConnect();

  const slugParam = String(params?.slug || '').toLowerCase();

  // Cari via slug utama ATAU custom_slug
  const undanganDoc: any = await Invitation.findOne({
    $or: [{ slug: slugParam }, { custom_slug: slugParam }],
  }).lean();

  if (!undanganDoc) notFound();

  // Naikkan views di server
  try {
    await Invitation.updateOne({ _id: undanganDoc._id }, { $inc: { views: 1 } }, { strict: false });
  } catch {}

  const undangan: any = serialize(undanganDoc);

  // Pilih template (fallback 'modern')
  const key = String(undangan.template || 'modern').toLowerCase();
  const TemplateComponent: any =
    (templateComponentMap as any)[key] || (templateComponentMap as any)['modern'];

  // Nama tamu dari ?tamu=
  const namaTamu =
    searchParams?.tamu
      ? String(searchParams.tamu).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : '';

  // Slot komponen interaktif yang dipakai template
  const templateData: any = {
    ...undangan,
    components: {
      RSVPForm: <RSVPForm slug={undangan.slug} namaTamu={namaTamu} />,
      Guestbook: <WeddingWishes slug={undangan.slug} />,
      QRCode: namaTamu ? <QRCodeGuest slug={undangan.slug} guestName={namaTamu} /> : null,
    },
  };

  // Handle expired
  if (undangan.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-yellow-50 text-yellow-600">
          <h2 className="text-xl font-bold mb-2">Undangan Telah Kadaluarsa</h2>
          <p>Undangan ini telah melewati masa aktif (1 tahun).</p>
          <p className="mt-2 text-sm">
            Dibuat pada: {new Date(undangan.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateComponent data={templateData} />

      {undangan.acara_utama && (
        <div className="max-w-xl mx-auto my-8">
          <AddToCalendar event={undangan.acara_utama} />
        </div>
      )}
    </>
  );
}
