import GuestbookClientPage from "./client-page"; // ⬅️ ini file baru: client-page.tsx

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <GuestbookClientPage slug={slug} />;
}
