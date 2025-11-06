// components/SeoHead.js
import Head from "next/head";

export default function SeoHead({
  title,
  description,
  keywords,
  siteName = "Dreamslink Invitation",
  noindex = false,
  canonical,
}) {
  const t = title ? `${title} - ${siteName}` : siteName;
  const d =
    description ||
    "Buat undangan pernikahan digital elegan & modern dengan Dreamslink Invitation.";
  const k =
    keywords ||
    "undangan digital, undangan pernikahan, wedding invitation, undangan online";

  return (
    <Head>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="keywords" content={k} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}
