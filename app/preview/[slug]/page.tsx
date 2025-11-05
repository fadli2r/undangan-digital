import PreviewClient from "./PreviewClient";

export default async function PreviewPage(props: any) {
  const params = await props.params;
  const slug = params?.slug || "classic";

  return <PreviewClient slug={slug} />;
}
