"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  today: {
    total_sales: number;
    total_transactions: number;
  };
  total_products: number;
  total_customers: number;
  sales_chart: {
    tanggal: string;
    total: number;
  }[];
  top_products: {
    id: number;
    code: string;
    name: string;
    total_qty: number;
    total_sales: number;
  }[];
  recent_sales: {
    id: number;
    invoice_number: string;
    sale_date: string;
    customer_name: string;
    total_amount: number;
    status: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/dashboard"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Gagal mengambil data dashboard"
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Memuat dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>

        <button
          onClick={loadDashboard}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxChartValue = Math.max(
    ...data.sales_chart.map(
      (item) => item.total
    ),
    1
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Ringkasan aktivitas Kasir POS hari ini
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Penjualan Hari Ini
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {formatRupiah(
              data.today.total_sales
            )}
          </h2>

          <p className="mt-1 text-sm text-green-600">
            Penjualan hari ini
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Transaksi Hari Ini
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {data.today.total_transactions}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Transaksi
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Produk
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {data.total_products}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Produk tersedia
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pelanggan
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {data.total_customers}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Total pelanggan
          </p>
        </div>
      </div>

      {/* GRAFIK + PRODUK TERLARIS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* GRAFIK */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold">
            Grafik Penjualan 7 Hari
          </h2>

          <div className="mt-6 flex h-64 items-end gap-3 rounded-lg bg-gray-50 p-4">
            {data.sales_chart.length === 0 ? (
              <div className="flex w-full items-center justify-center">
                <p className="text-gray-400">
                  Belum ada data penjualan
                </p>
              </div>
            ) : (
              data.sales_chart.map((item) => {
                const height =
                  (item.total /
                    maxChartValue) *
                  100;

                return (
                  <div
                    key={item.tanggal}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className="w-full rounded-t-lg bg-blue-500"
                      style={{
                        height: `${Math.max(
                          height,
                          3
                        )}%`,
                      }}
                      title={formatRupiah(
                        item.total
                      )}
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(
                        item.tanggal
                      ).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PRODUK TERLARIS */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Produk Terlaris
          </h2>

          <div className="mt-5 space-y-4">
            {data.top_products.length ===
            0 ? (
              <div className="text-center text-gray-400">
                Belum ada data produk
              </div>
            ) : (
              data.top_products.map(
                (product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {index + 1}
                      </span>

                      <div>
                        <p className="font-medium">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {product.total_qty} terjual
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold">
                      {formatRupiah(
                        product.total_sales
                      )}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* TRANSAKSI TERBARU */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Transaksi Terbaru
            </h2>

            <p className="text-sm text-gray-500">
              Data transaksi dari database
            </p>
          </div>

          <a
            href="/sales"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Lihat Semua
          </a>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  No. Transaksi
                </th>

                <th className="px-4 py-3">
                  Tanggal
                </th>

                <th className="px-4 py-3">
                  Pelanggan
                </th>

                <th className="px-4 py-3">
                  Total
                </th>

                <th className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {data.recent_sales.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                data.recent_sales.map(
                  (sale) => (
                    <tr
                      key={sale.id}
                      className="border-b"
                    >
                      <td className="px-4 py-3 font-medium">
                        {sale.invoice_number}
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          sale.sale_date
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {sale.customer_name}
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        {formatRupiah(
                          Number(
                            sale.total_amount
                          )
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          {sale.status}
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
    </div>
  );
}