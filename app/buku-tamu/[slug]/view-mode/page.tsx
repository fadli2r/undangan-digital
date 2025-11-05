import ViewClient from "./view-client"; // komponen client-side

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ViewClient slug={slug} />;
}
