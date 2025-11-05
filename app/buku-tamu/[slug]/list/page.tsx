// app/buku-tamu/[slug]/list-undangan/page.tsx
import ListUndanganPage from "./list-undangan";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ListUndanganPage slug={slug} />;
}
