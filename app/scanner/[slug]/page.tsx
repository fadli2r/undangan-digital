
import ScannerClient from "./Scanner-client"; // Rename filenya ya (ScannerClient.tsx → scanner-client.tsx)

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ScannerClient slug={slug} />;
}
