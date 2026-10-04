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

  const [reportType, setReportType] = useState("Penjualan");

  const [data, setData] = useState<ReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    if (!startDate || !endDate) {
      setError("Tanggal awal dan tanggal akhir wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data laporan"
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data laporan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getPaymentLabel = (payment: string) => {
    switch (payment) {
      case "cash":
        return "Tunai";
      case "qris":
        return "QRIS";
      case "transfer":
        return "Transfer";
      default:
        return payment;
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Laporan
          </h1>

          <p className="text-gray-500">
            Laporan penjualan dan pembelian
          </p>
        </div>

        <button
          onClick={printReport}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          🖨 Cetak Laporan
        </button>
      </div>

      {/* FILTER */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Jenis Laporan
            </label>

            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tanggal Awal
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tanggal Akhir
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Memuat..."
                : "Tampilkan Laporan"}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          {(reportType === "Penjualan" ||
            reportType === "Semua") && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Penjualan
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatRupiah(
                  data.summary.totalSales
                )}
              </p>
            </div>
          )}

          {(reportType === "Pembelian" ||
            reportType === "Semua") && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Pembelian
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {formatRupiah(
                  data.summary.totalPurchase
                )}
              </p>
            </div>
          )}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Transaksi
            </p>

            <p className="mt-2 text-2xl font-bold">
              {data.summary.totalTransaction}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Selisih Penjualan - Pembelian
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatRupiah(
                data.summary.estimatedProfit
              )}
            </p>
          </div>
        </div>
      )}

      {/* TABEL PENJUALAN */}
      {data &&
        (reportType === "Penjualan" ||
          reportType === "Semua") && (
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-lg font-semibold">
                Data Penjualan
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      No
                    </th>

                    <th className="px-4 py-3 text-left">
                      Tanggal
                    </th>

                    <th className="px-4 py-3 text-left">
                      Invoice
                    </th>

                    <th className="px-4 py-3 text-left">
                      Pelanggan
                    </th>

                    <th className="px-4 py-3 text-left">
                      Pembayaran
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {data.sales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada data penjualan
                      </td>
                    </tr>
                  ) : (
                    data.sales.map((sale, index) => (
                      <tr key={sale.id}>
                        <td className="px-4 py-3">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(sale.date)}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {sale.invoice}
                        </td>

                        <td className="px-4 py-3">
                          {sale.customer}
                        </td>

                        <td className="px-4 py-3">
                          {getPaymentLabel(
                            sale.payment
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {formatRupiah(sale.total)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* TABEL PEMBELIAN */}
      {data &&
        (reportType === "Pembelian" ||
          reportType === "Semua") && (
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-lg font-semibold">
                Data Pembelian
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      No
                    </th>

                    <th className="px-4 py-3 text-left">
                      Tanggal
                    </th>

                    <th className="px-4 py-3 text-left">
                      Invoice
                    </th>

                    <th className="px-4 py-3 text-left">
                      Supplier
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {data.purchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada data pembelian
                      </td>
                    </tr>
                  ) : (
                    data.purchases.map(
                      (purchase, index) => (
                        <tr key={purchase.id}>
                          <td className="px-4 py-3">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3">
                            {formatDate(
                              purchase.date
                            )}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {purchase.invoice}
                          </td>

                          <td className="px-4 py-3">
                            {purchase.supplier}
                          </td>

                          <td className="px-4 py-3 text-right font-medium">
                            {formatRupiah(
                              purchase.total
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              {purchase.status}
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

      {/* PRINT INFO */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
        Periode laporan:{" "}
        <strong>{startDate}</strong> sampai{" "}
        <strong>{endDate}</strong>
      </div>
    </div>
  );
}