import Settings from "./settings"; // komponen client-side

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Settings slug={slug} />;
}
