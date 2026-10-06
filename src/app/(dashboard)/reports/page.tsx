"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  date: string;
  invoice: string;
  customer: string;
  total: number;
  payment: string;
  status: string;
};

type Purchase = {
  id: number;
  date: string;
  invoice: string;
  supplier: string;
  total: number;
  status: string;
};

type ReportData = {
  sales: Sale[];
  purchases: Purchase[];
  summary: {
    totalSales: number;
    totalPurchase: number;
    totalTransaction: number;
    estimatedProfit: number;
  };
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-03");

  const [reportType, setReportType] =
    useState("Penjualan");

  const [data, setData] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [printRequested, setPrintRequested] =
    useState(false);

  /* =====================================================
     LOAD REPORT
  ====================================================== */

  const loadReport = async () => {
    if (!startDate || !endDate) {
      setError(
        "Tanggal awal dan tanggal akhir wajib diisi."
      );
      return;
    }

    if (startDate > endDate) {
      setError(
        "Tanggal awal tidak boleh lebih besar dari tanggal akhir."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/reports?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(
          endDate
        )}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Gagal mengambil data laporan."
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data laporan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /* =====================================================
     PRINT EFFECT
  ====================================================== */

  useEffect(() => {
    if (!printRequested || !data) {
      return;
    }

    setPrintRequested(false);

    const printElement =
      document.getElementById(
        "print-report"
      );

    if (!printElement) {
      return;
    }

    document.body.classList.add(
      "printing-report"
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  }, [printRequested, data]);

  /* =====================================================
     AFTER PRINT
  ====================================================== */

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove(
        "printing-report"
      );
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );

      document.body.classList.remove(
        "printing-report"
      );
    };
  }, []);

  /* =====================================================
     FORMAT RUPIAH
  ====================================================== */

  const formatRupiah = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  /* =====================================================
     FORMAT TANGGAL TRANSAKSI
  ====================================================== */

  const formatDate = (
    value: string
  ) => {
    if (!value) return "-";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year =
      date.getFullYear();

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  /* =====================================================
     FORMAT PERIODE
  ====================================================== */

  const formatPeriodDate = (
    value: string
  ) => {
    if (!value) return "-";

    const parts =
      value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [
      year,
      month,
      day,
    ] = parts;

    return `${day}-${month}-${year}`;
  };

  /* =====================================================
     PAYMENT
  ====================================================== */

  const getPaymentLabel = (
    payment: string
  ) => {
    switch (
      payment?.toLowerCase()
    ) {
      case "cash":
        return "Tunai";

      case "qris":
        return "QRIS";

      case "transfer":
        return "Transfer";

      default:
        return payment || "-";
    }
  };

  /* =====================================================
     STATUS
  ====================================================== */

  const getStatusClass = (
    status: string
  ) => {
    const normalized =
      status?.toLowerCase();

    if (
      normalized === "success" ||
      normalized === "paid" ||
      normalized === "lunas" ||
      normalized === "completed" ||
      normalized === "selesai"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (
      normalized === "pending" ||
      normalized === "proses" ||
      normalized === "processing"
    ) {
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "batal"
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  };

  /* =====================================================
     PRINT REPORT
  ====================================================== */

  const printReport = () => {
    if (!data || loading) {
      return;
    }

    setPrintRequested(true);
  };

  const showSales =
    reportType === "Penjualan" ||
    reportType === "Semua";

  const showPurchases =
    reportType === "Pembelian" ||
    reportType === "Semua";

  return (
    <>
      {/* =====================================================
          AREA APLIKASI
          TIDAK DICETAK
      ====================================================== */}

      <div className="space-y-6 print:hidden">

        {/* =================================================
            FILTER
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* JENIS LAPORAN */}

            <div>
              <label
                htmlFor="reportType"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Jenis Laporan
              </label>

              <select
                id="reportType"
                value={reportType}
                onChange={(e) =>
                  setReportType(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Penjualan">
                  Penjualan
                </option>

                <option value="Pembelian">
                  Pembelian
                </option>

                <option value="Semua">
                  Semua
                </option>
              </select>
            </div>

            {/* TANGGAL AWAL */}

            <div>
              <label
                htmlFor="startDate"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Tanggal Awal
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                max={
                  endDate ||
                  undefined
                }
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* TANGGAL AKHIR */}

            <div>
              <label
                htmlFor="endDate"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Tanggal Akhir
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                min={
                  startDate ||
                  undefined
                }
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* BUTTON */}

            <div className="flex items-end gap-2">

              <button
                type="button"
                onClick={
                  loadReport
                }
                disabled={loading}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <span>🔎</span>
                    Tampilkan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  printReport
                }
                disabled={
                  !data ||
                  loading
                }
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>🖨</span>
                Cetak
              </button>

            </div>
          </div>

          {/* PERIODE */}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm">

            <span className="font-medium text-slate-500">
              Periode:
            </span>

            <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {formatPeriodDate(
                startDate
              )}
            </span>

            <span className="text-slate-400">
              —
            </span>

            <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {formatPeriodDate(
                endDate
              )}
            </span>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <div>
                <p className="font-semibold">
                  Gagal memuat laporan
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading &&
          !data &&
          !error && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Memuat data laporan...
              </p>

            </div>
          )}

        {/* =================================================
            SUMMARY
        ================================================== */}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {showSales && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                <p className="text-sm font-medium text-slate-500">
                  Total Penjualan
                </p>

                <p className="mt-2 text-xl font-bold text-slate-800">
                  {formatRupiah(
                    data.summary
                      .totalSales
                  )}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Total nilai penjualan.
                </p>

              </div>
            )}

            {showPurchases && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                <p className="text-sm font-medium text-slate-500">
                  Total Pembelian
                </p>

                <p className="mt-2 text-xl font-bold text-slate-800">
                  {formatRupiah(
                    data.summary
                      .totalPurchase
                  )}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Total nilai pembelian.
                </p>

              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <p className="text-sm font-medium text-slate-500">
                Total Transaksi
              </p>

              <p className="mt-2 text-xl font-bold text-slate-800">
                {
                  data.summary
                    .totalTransaction
                }
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Jumlah seluruh transaksi.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <p className="text-sm font-medium text-slate-500">
                Selisih Penjualan - Pembelian
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  data.summary
                    .estimatedProfit >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatRupiah(
                  data.summary
                    .estimatedProfit
                )}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Estimasi selisih transaksi.
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            DATA PENJUALAN
        ================================================== */}

        {data &&
          showSales && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Data Penjualan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Daftar transaksi penjualan pada periode yang dipilih.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                  {
                    data.sales.length
                  }{" "}
                  transaksi
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-sm">

                  <thead className="bg-slate-50/80">

                    <tr className="border-b border-slate-100">

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        No
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Tanggal
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Invoice
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Pelanggan
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Pembayaran
                      </th>

                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">
                        Total
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {data.sales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-slate-400"
                        >
                          Tidak ada data penjualan.
                        </td>
                      </tr>
                    ) : (
                      data.sales.map(
                        (
                          sale,
                          index
                        ) => (
                          <tr
                            key={
                              sale.id
                            }
                            className="transition hover:bg-slate-50/70"
                          >

                            <td className="px-5 py-3.5 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                              {formatDate(
                                sale.date
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-semibold text-slate-800">
                              {
                                sale.invoice
                              }
                            </td>

                            <td className="px-5 py-3.5 text-slate-600">
                              {sale.customer ||
                                "-"}
                            </td>

                            <td className="px-5 py-3.5">

                              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                                {getPaymentLabel(
                                  sale.payment
                                )}
                              </span>

                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-800">
                              {formatRupiah(
                                sale.total
                              )}
                            </td>

                            <td className="px-5 py-3.5">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                  sale.status
                                )}`}
                              >
                                {sale.status ||
                                  "-"}
                              </span>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </div>
          )}

        {/* =================================================
            DATA PEMBELIAN
        ================================================== */}

        {data &&
          showPurchases && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Data Pembelian
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Daftar transaksi pembelian pada periode yang dipilih.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                  {
                    data.purchases
                      .length
                  }{" "}
                  transaksi
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px] text-sm">

                  <thead className="bg-slate-50/80">

                    <tr className="border-b border-slate-100">

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        No
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Tanggal
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Invoice
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Supplier
                      </th>

                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">
                        Total
                      </th>

                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {data.purchases.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-slate-400"
                        >
                          Tidak ada data pembelian.
                        </td>
                      </tr>
                    ) : (
                      data.purchases.map(
                        (
                          purchase,
                          index
                        ) => (
                          <tr
                            key={
                              purchase.id
                            }
                            className="transition hover:bg-slate-50/70"
                          >

                            <td className="px-5 py-3.5 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                              {formatDate(
                                purchase.date
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-semibold text-slate-800">
                              {
                                purchase.invoice
                              }
                            </td>

                            <td className="px-5 py-3.5 text-slate-600">
                              {
                                purchase.supplier ||
                                "-"
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-800">
                              {formatRupiah(
                                purchase.total
                              )}
                            </td>

                            <td className="px-5 py-3.5">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                  purchase.status
                                )}`}
                              >
                                {
                                  purchase.status ||
                                  "-"
                                }
                              </span>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </div>
          )}

      </div>

      {/* =====================================================
          AREA KHUSUS CETAK
      ====================================================== */}

      {data && (
        <div
          id="print-report"
          className="hidden w-full bg-white text-black"
        >

          {/* HEADER */}

          <div className="mb-6 border-b-2 border-slate-800 pb-4">

            <h1 className="text-2xl font-bold text-slate-900">
              Laporan {reportType}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Periode:{" "}
              <strong>
                {formatPeriodDate(
                  startDate
                )}
              </strong>{" "}
              —{" "}
              <strong>
                {formatPeriodDate(
                  endDate
                )}
              </strong>
            </p>

          </div>

          {/* SUMMARY */}

          <div className="mb-6 grid grid-cols-4 gap-3">

            {showSales && (
              <div className="rounded-lg border border-slate-300 p-3">

                <p className="text-xs text-slate-500">
                  Total Penjualan
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatRupiah(
                    data.summary
                      .totalSales
                  )}
                </p>

              </div>
            )}

            {showPurchases && (
              <div className="rounded-lg border border-slate-300 p-3">

                <p className="text-xs text-slate-500">
                  Total Pembelian
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatRupiah(
                    data.summary
                      .totalPurchase
                  )}
                </p>

              </div>
            )}

            <div className="rounded-lg border border-slate-300 p-3">

              <p className="text-xs text-slate-500">
                Total Transaksi
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {
                  data.summary
                    .totalTransaction
                }
              </p>

            </div>

            <div className="rounded-lg border border-slate-300 p-3">

              <p className="text-xs text-slate-500">
                Selisih
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {formatRupiah(
                  data.summary
                    .estimatedProfit
                )}
              </p>

            </div>

          </div>

          {/* PENJUALAN */}

          {showSales && (
            <div className="mb-8">

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-base font-bold text-slate-900">
                  Data Penjualan
                </h2>

                <span className="text-xs text-slate-500">
                  {
                    data.sales.length
                  }{" "}
                  transaksi
                </span>

              </div>

              <table className="w-full border-collapse text-xs">

                <thead>

                  <tr className="border border-slate-400 bg-slate-100">

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      No
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Tanggal
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Invoice
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Pelanggan
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Pembayaran
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-right">
                      Total
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.sales.map(
                    (
                      sale,
                      index
                    ) => (
                      <tr
                        key={
                          sale.id
                        }
                        className="print-row"
                      >

                        <td className="border border-slate-400 px-2 py-2">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap border border-slate-400 px-2 py-2">
                          {formatDate(
                            sale.date
                          )}
                        </td>

                        <td className="border border-slate-400 px-2 py-2 font-medium">
                          {
                            sale.invoice
                          }
                        </td>

                        <td className="border border-slate-400 px-2 py-2">
                          {sale.customer ||
                            "-"}
                        </td>

                        <td className="border border-slate-400 px-2 py-2">
                          {getPaymentLabel(
                            sale.payment
                          )}
                        </td>

                        <td className="whitespace-nowrap border border-slate-400 px-2 py-2 text-right font-medium">
                          {formatRupiah(
                            sale.total
                          )}
                        </td>

                        <td className="border border-slate-400 px-2 py-2">
                          {
                            sale.status ||
                            "-"
                          }
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* PEMBELIAN */}

          {showPurchases && (
            <div className="mb-8">

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-base font-bold text-slate-900">
                  Data Pembelian
                </h2>

                <span className="text-xs text-slate-500">
                  {
                    data.purchases
                      .length
                  }{" "}
                  transaksi
                </span>

              </div>

              <table className="w-full border-collapse text-xs">

                <thead>

                  <tr className="border border-slate-400 bg-slate-100">

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      No
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Tanggal
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Invoice
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Supplier
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-right">
                      Total
                    </th>

                    <th className="border border-slate-400 px-2 py-2 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.purchases.map(
                    (
                      purchase,
                      index
                    ) => (
                      <tr
                        key={
                          purchase.id
                        }
                        className="print-row"
                      >

                        <td className="border border-slate-400 px-2 py-2">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap border border-slate-400 px-2 py-2">
                          {formatDate(
                            purchase.date
                          )}
                        </td>

                        <td className="border border-slate-400 px-2 py-2 font-medium">
                          {
                            purchase.invoice
                          }
                        </td>

                        <td className="border border-slate-400 px-2 py-2">
                          {
                            purchase.supplier ||
                            "-"
                          }
                        </td>

                        <td className="whitespace-nowrap border border-slate-400 px-2 py-2 text-right font-medium">
                          {formatRupiah(
                            purchase.total
                          )}
                        </td>

                        <td className="border border-slate-400 px-2 py-2">
                          {
                            purchase.status ||
                            "-"
                          }
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* FOOTER */}

          <div className="mt-8 border-t border-slate-300 pt-3 text-xs text-slate-500">

            <div className="flex justify-between">

              <span>
                Dicetak pada:{" "}
                {formatDate(
                  new Date().toISOString()
                )}
              </span>

              <span>
                Laporan {reportType}
              </span>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          PRINT CSS
      ====================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          html,
          body {
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body.printing-report {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /*
           * SEMBUNYIKAN SELURUH UI APLIKASI
           */

          body.printing-report
            > * {
            visibility: hidden !important;
          }

          /*
           * TAMPILKAN HANYA LAPORAN
           */

          body.printing-report
            #print-report,
          body.printing-report
            #print-report * {
            visibility: visible !important;
          }

          /*
           * POSISI AREA PRINT
           */

          body.printing-report
            #print-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            z-index: 2147483647 !important;
            box-sizing: border-box !important;
          }

          body.printing-report
            #print-report
            * {
            box-sizing: border-box !important;
          }

          /*
           * TABLE
           */

          body.printing-report
            #print-report
            table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          body.printing-report
            #print-report
            thead {
            display: table-header-group !important;
          }

          body.printing-report
            #print-report
            tbody {
            display: table-row-group !important;
          }

          body.printing-report
            #print-report
            tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          body.printing-report
            #print-report
            .print-row {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /*
           * JUDUL
           */

          body.printing-report
            #print-report
            h1,
          body.printing-report
            #print-report
            h2 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          /*
           * WARNA TABEL / BACKGROUND
           */

          body.printing-report
            #print-report
            th {
            background: #f1f5f9 !important;
            color: #000000 !important;
          }

          body.printing-report
            #print-report
            td,
          body.printing-report
            #print-report
            th {
            color: #000000 !important;
          }

          /*
           * JANGAN POTONG BOX SUMMARY
           */

          body.printing-report
            #print-report
            .grid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </>
  );
}