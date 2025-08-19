import { useRouter } from 'next/router';

export default function BackButton() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <button
      onClick={() => router.push(`/edit-undangan/${slug}`)}
      className="btn btn-light-secondary mb-5"
    >
      <i className="ki-duotone ki-arrow-left fs-2">
        <span className="path1"></span>
        <span className="path2"></span>
      </i>
      Kembali
    </button>
  );
}
