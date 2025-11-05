// pages/invoice/[id].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Helpers =====
  const fmtIDR = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(n || 0));

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  useEffect(() => {
    if (!router.isReady || !id) return;
    (async () => {
      setLoading(true);
      try {
        // Pastikan API /api/user/invoice/[id] mengembalikan struktur sbb. (dengan fallback oke):
        // { invoiceId, status, invoiceUrl, createdAt, dueAt|expiresAt,
        //   amount, quantity, items[], package:{name}, buyer:{name,email,phone,address}, xendit:{paymentChannel,payerEmail} }
        const res = await fetch(`/api/user/invoice/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setInvoice(data.invoice || null);
        else setInvoice(null);
      } catch (e) {
        console.error("Gagal fetch invoice:", e);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router.isReady]);

  // Tabel items: pakai invoice.items kalau ada; fallback satu baris paket
  const items = useMemo(() => {
    if (Array.isArray(invoice?.items) && invoice.items.length) {
      return invoice.items.map((it) => ({
        name: it.name,
        qty: it.qty ?? 1,
        unitPrice: it.unitPrice ?? it.price ?? 0,
        amount: it.amount ?? (it.unitPrice ?? it.price ?? 0) * (it.qty ?? 1),
      }));
    }
    return [
      {
        name: invoice?.package?.name || "-",
        qty: invoice?.quantity ?? 1,
        unitPrice: invoice?.amount ?? 0,
        amount: invoice?.amount ?? 0,
      },
    ];
  }, [invoice]);

  const subtotal = useMemo(
    () => items.reduce((a, b) => a + Number(b.amount || 0), 0),
    [items]
  );

  if (loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-primary" role="status" />
        </div>
      </UserLayout>
    );
  }

  if (!invoice) {
    return (
      <UserLayout>
        <div className="container-xxl py-10">
          <div className="alert alert-danger">
            <i className="ki-duotone ki-information-5 fs-2 me-2" />
            Invoice tidak ditemukan.
          </div>
        </div>
      </UserLayout>
    );
  }

  const isPending = invoice.status === "pending";
  const isPaid = invoice.status === "paid";
  const statusBadgeClass =
    isPaid
      ? "badge badge-light-success"
      : isPending
      ? "badge badge-light-warning"
      : invoice.status === "expired" || invoice.status === "canceled"
      ? "badge badge-light-danger"
      : "badge badge-light-primary";

  // Data buyer (user yang order) — pastikan API mengisi buyer bila ada
  const buyer = invoice.buyer || {};
  const buyerName = buyer.name || invoice.userName || "-";
  const buyerEmail = buyer.email || invoice.email || "-";
  const buyerPhone = buyer.phone || "-";
  const buyerAddress =
    buyer.address ||
    buyer.addressLine ||
    buyer.addressText ||
    ""; // opsional

  // Data issuer (perusahaan kamu) — silakan sesuaikan
  const issuer = {
    name: "Dreams Link",
    address1: "Jl. Babadan Rukun 07/34",
    address2: "Surabaya, Indonesia",
    email: "billing@dreamslink.id",
  };

  const dueDate = invoice.dueAt || invoice.expiresAt || null;

  return (
    <UserLayout>
      <Head>
        <title>Invoice #{invoice.invoiceId}</title>
      </Head>
 {/* Back Button */}
          <div className="mb-5">
            <button
              onClick={() => router.push("/profile/billing")}
              className="btn btn-light btn-sm"
            >
              ← Kembali ke Billing
            </button>
          </div>
      {/* begin::Content */}
      <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
        {/* begin::Container */}
          {/* begin::Invoice main */}
          <div className="card">
            {/* begin::Body */}
            <div className="card-body p-lg-20">
              {/* begin::Layout */}
              <div className="d-flex flex-column flex-xl-row">
                {/* begin::Content */}
                <div className="flex-lg-row-fluid me-xl-18 mb-10 mb-xl-0">
                  {/* begin::Invoice content */}
                  <div className="mt-n1">
                    {/* begin::Top */}
                    <div className="d-flex flex-stack pb-10">
                      {/* begin::Logo */}
                      <Link href="/" className="d-inline-block">
                        <img alt="Logo" src="/images/dreamslink-b.png" style={{ height: 36 }} />
                      </Link>
                      {/* end::Logo */}
                      {/* begin::Action */}
                      {isPending && invoice.invoiceUrl && (
                        <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-success">
                          Pay Now
                        </a>
                      )}
                      {/* end::Action */}
                    </div>
                    {/* end::Top */}

                    {/* begin::Wrapper */}
                    <div className="m-0">
                      {/* begin::Label */}
                      <div className="fw-bold fs-3 text-gray-800 mb-8 d-flex align-items-center">
                        <span className="me-3">Invoice #{invoice.invoiceId}</span>
                        <button
                          type="button"
                          className="btn btn-icon btn-sm btn-light"
                          title="Salin Invoice ID"
                          onClick={() => copyText(invoice.invoiceId)}
                        >
                          <i className="ki-duotone ki-copy fs-4">
                            <span className="path1" />
                            <span className="path2" />
                          </i>
                        </button>
                      </div>
                      {/* end::Label */}

                      {/* begin::Row dates */}
                      <div className="row g-5 mb-11">
                        <div className="col-sm-6">
                          <div className="fw-semibold fs-7 text-gray-600 mb-1">Issue Date:</div>
                          <div className="fw-bold fs-6 text-gray-800">{fmtDate(invoice.createdAt)}</div>
                        </div>
                        <div className="col-sm-6">
                          <div className="fw-semibold fs-7 text-gray-600 mb-1">Due Date:</div>
                          <div className="fw-bold fs-6 text-gray-800 d-flex align-items-center flex-wrap">
                            <span className="pe-2">{fmtDate(dueDate)}</span>
                            {isPending && dueDate && (
                              <span className="fs-7 text-danger d-flex align-items-center">
                                <span className="bullet bullet-dot bg-danger me-2" />
                                Unpaid
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* end::Row dates */}

                      {/* begin::Row parties */}
                      <div className="row g-5 mb-12">
                        <div className="col-sm-6">
                          <div className="fw-semibold fs-7 text-gray-600 mb-1">Issue For:</div>
                          <div className="fw-bold fs-6 text-gray-800">{buyerName}</div>
                          <div className="fw-semibold fs-7 text-gray-600">
                            {buyerEmail}
                            {buyerPhone && <><br />{buyerPhone}</>}
                            {buyerAddress && (
                              <>
                                <br />
                                {buyerAddress}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="fw-semibold fs-7 text-gray-600 mb-1">Issued By:</div>
                          <div className="fw-bold fs-6 text-gray-800">{issuer.name}</div>
                          <div className="fw-semibold fs-7 text-gray-600">
                            {issuer.address1}
                            <br />
                            {issuer.address2}
                            <br />
                            {issuer.email}
                          </div>
                        </div>
                      </div>
                      {/* end::Row parties */}

                      {/* begin::Content (items) */}
                      <div className="flex-grow-1">
                        {/* begin::Table */}
                        <div className="table-responsive border-bottom mb-9">
                          <table className="table mb-3">
                            <thead>
                              <tr className="border-bottom fs-6 fw-bold text-muted">
                                <th className="min-w-175px pb-2">Description</th>
                                <th className="min-w-80px text-end pb-2">Price</th>
                                <th className="min-w-70px text-end pb-2">Qty</th>
                                <th className="min-w-100px text-end pb-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((it, idx) => (
                                <tr key={idx} className="fw-bold text-gray-700 fs-5 text-end">
                                  <td className="pt-6 text-start">
                                    <i className="fa fa-genderless text-primary fs-2 me-2" />
                                    {it.name}
                                  </td>
                                  <td className="pt-6">{fmtIDR(it.unitPrice)}</td>
                                  <td className="pt-6">{it.qty}</td>
                                  <td className="pt-6 text-gray-900 fw-bolder">{fmtIDR(it.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* end::Table */}

                        {/* begin::Totals */}
                        <div className="d-flex justify-content-end">
                          <div className="mw-300px">
                            <div className="d-flex flex-stack mb-3">
                              <div className="fw-semibold pe-10 text-gray-600 fs-7">Subtotal:</div>
                              <div className="text-end fw-bold fs-6 text-gray-800">{fmtIDR(subtotal)}</div>
                            </div>
                            {/* Pajak/biaya lain bisa ditambahkan di sini */}
                            <div className="d-flex flex-stack">
                              <div className="fw-semibold pe-10 text-gray-600 fs-7">Total</div>
                              <div className="text-end fw-bold fs-6 text-gray-800">
                                {fmtIDR(invoice.amount ?? subtotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* end::Totals */}
                      </div>
                      {/* end::Content */}
                    </div>
                    {/* end::Wrapper */}
                  </div>
                  {/* end::Invoice content */}
                </div>
                {/* end::Content */}

                {/* begin::Sidebar */}
                <div className="m-0">
                  {/* begin::Invoice sidebar */}
                  <div className="d-print-none border border-dashed border-gray-300 card-rounded h-lg-100 min-w-md-350px p-9 bg-lighten">
                    {/* begin::Labels */}
                    <div className="mb-8">
                      <span className={statusBadgeClass}>{String(invoice.status).toUpperCase()}</span>
                      {isPending && <span className="badge badge-light-warning ms-2">Pending Payment</span>}
                    </div>
                    {/* end::Labels */}

                    {/* begin::Title */}
                    <h6 className="mb-8 fw-bolder text-gray-600 text-hover-primary">PAYMENT DETAILS</h6>
                    {/* end::Title */}

                    {/* begin::Item */}
                    <div className="mb-6">
                      <div className="fw-semibold text-gray-600 fs-7">Payer Email:</div>
                      <div className="fw-bold text-gray-800 fs-6">
                        {invoice?.xendit?.payerEmail || buyerEmail || "-"}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="fw-semibold text-gray-600 fs-7">Payment Channel:</div>
                      <div className="fw-bold text-gray-800 fs-6">
                        {invoice?.xendit?.paymentChannel || "-"}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="fw-semibold text-gray-600 fs-7">Invoice Link:</div>
                      <div className="fw-bold fs-6">
                        {invoice.invoiceUrl ? (
                          <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="link-primary">
                            Buka di Xendit
                          </a>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-15">
                      <div className="fw-semibold text-gray-600 fs-7">Invoice ID:</div>
                      <div className="d-flex align-items-center">
                        <div className="fw-bold text-gray-800 fs-6 me-3">{invoice.invoiceId}</div>
                        <button
                          type="button"
                          className="btn btn-icon btn-sm btn-light"
                          onClick={() => copyText(invoice.invoiceId)}
                          title="Salin Invoice ID"
                        >
                          <i className="ki-duotone ki-copy fs-4">
                            <span className="path1" />
                            <span className="path2" />
                          </i>
                        </button>
                      </div>
                    </div>

                    <h6 className="mb-8 fw-bolder text-gray-600 text-hover-primary">ACTIONS</h6>
                    <div className="d-flex flex-wrap gap-3">
                      <button type="button" className="btn btn-light" onClick={() => window.print()}>
                        <i className="ki-duotone ki-printer fs-4 me-1">
                          <span className="path1" />
                          <span className="path2" />
                        </i>
                        Print
                      </button>
                      {isPending && invoice.invoiceUrl && (
                        <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-success">
                          Pay Now
                        </a>
                      )}
                    </div>
                  </div>
                  {/* end::Invoice sidebar */}
                </div>
                {/* end::Sidebar */}
              </div>
              {/* end::Layout */}
            </div>
            {/* end::Body */}
          </div>
          {/* end::Invoice main */}
        </div>
        {/* end::Container */}
      {/* end::Content */}
    </UserLayout>
  );
}
