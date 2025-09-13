// app/katalog/page.tsx
import KatalogClient from "./KatalogClient";

export default async function KatalogPage(props: any) {
  const searchParams = await props.searchParams;
  const raw = searchParams?.category;

  const initialCategory =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";

  return <KatalogClient initialCategory={initialCategory ?? ""} />;
}
