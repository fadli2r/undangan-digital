import PortofolioClient from "./PortofolioClient";

export default async function PortofolioPage(props: any) {
  const searchParams = await props.searchParams;
  const raw = searchParams?.category;

  const initialCategory =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";

  return <PortofolioClient initialCategory={initialCategory ?? ""} />;
}
