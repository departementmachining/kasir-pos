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
  const [data, setData] = useState<DashboardData | null>(null);
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

      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data dashboard",
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard",
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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px]">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxChartValue = Math.max(
    ...data.sales_chart.map((item) => item.total),
    1,
  );

  const chartPoints = data.sales_chart
    .map((item, index) => {
      const x =
        data.sales_chart.length === 1
          ? 50
          : (index / (data.sales_chart.length - 1)) * 100;

      const y =
        90 - (item.total / maxChartValue) * 70;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="text-slate-900">
      <main className="space-y-6">
        {/* =========================
            SUMMARY CARDS
        ========================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* PENJUALAN */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Penjualan Hari Ini
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {formatRupiah(data.today.total_sales)}
                </h2>

                <p className="mt-2 text-xs font-medium text-blue-600">
                  Penjualan hari ini
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                💰
              </div>
            </div>

            <div className="relative mt-4 flex h-8 items-end gap-1.5">
              {[35, 50, 42, 68, 55, 80, 72, 95].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-full bg-blue-400/50 transition group-hover:bg-blue-500/60"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* TRANSAKSI */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Transaksi Hari Ini
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {data.today.total_transactions}
                </h2>

                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Transaksi
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                🛒
              </div>
            </div>
          </div>

          {/* PRODUK */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-50" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Produk
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {data.total_products}
                </h2>

                <p className="mt-2 text-xs font-medium text-green-600">
                  Produk tersedia
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl">
                📦
              </div>
            </div>
          </div>

          {/* PELANGGAN */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-50" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pelanggan
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {data.total_customers}
                </h2>

                <p className="mt-2 text-xs font-medium text-purple-600">
                  Total pelanggan
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl">
                👤
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            GRAFIK PENJUALAN
        ========================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Grafik Penjualan 7 Hari
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Performa penjualan berdasarkan data transaksi
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              7 Hari Terakhir
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-5">
            {data.sales_chart.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Belum ada data penjualan
              </div>
            ) : (
              <div className="relative h-64">
                {/* GRID */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[1000, 750, 500, 250, 0].map((value) => (
                    <div
                      key={value}
                      className="flex items-center gap-3"
                    >
                      <span className="w-8 text-right text-[10px] font-medium text-slate-400">
                        {value}
                      </span>

                      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                    </div>
                  ))}
                </div>

                {/* GRAPH */}
                <div className="absolute bottom-7 left-11 right-2 top-2">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full overflow-visible"
                  >
                    <defs>
                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#38bdf8"
                          stopOpacity="0.25"
                        />

                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {chartPoints && (
                      <>
                        <polyline
                          points={`${chartPoints} 100,100 0,100`}
                          fill="url(#salesGradient)"
                          stroke="none"
                        />

                        <polyline
                          points={chartPoints}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.8"
                          vectorEffect="non-scaling-stroke"
                        />
                      </>
                    )}
                  </svg>

                  {/* BARS */}
                  <div className="absolute inset-0 flex items-end justify-around gap-2">
                    {data.sales_chart.map((item) => {
                      const height =
                        (item.total / maxChartValue) * 82;

                      return (
                        <div
                          key={item.tanggal}
                          className="flex h-full flex-1 items-end justify-center"
                        >
                          <div
                            className="w-5 max-w-[38px] rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-cyan-500 sm:w-8"
                            style={{
                              height: `${Math.max(height, 4)}%`,
                            }}
                            title={formatRupiah(item.total)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* POINTS */}
                  <div className="pointer-events-none absolute inset-0">
                    {data.sales_chart.map((item, index) => {
                      const x =
                        data.sales_chart.length === 1
                          ? 50
                          : (index /
                              (data.sales_chart.length - 1)) *
                            100;

                      const y =
                        90 -
                        (item.total / maxChartValue) * 70;

                      return (
                        <div
                          key={item.tanggal}
                          className="absolute h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-500 shadow"
                          style={{
                            left: `calc(${x}% - 5px)`,
                            top: `calc(${y}% - 5px)`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* LABELS */}
                <div className="absolute bottom-0 left-11 right-2 flex justify-around">
                  {data.sales_chart.map((item) => (
                    <span
                      key={item.tanggal}
                      className="text-[10px] font-medium text-slate-400 sm:text-xs"
                    >
                      {new Date(
                        item.tanggal,
                      ).toLocaleDateString("id-ID", {
                        weekday: "short",
                      })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            PRODUK TERLARIS
        ========================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Produk Terlaris
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Produk dengan penjualan tertinggi
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-3 py-2 text-lg">
              ⭐
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.top_products.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400 md:col-span-2">
                Belum ada data produk
              </div>
            ) : (
              data.top_products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : "📦"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {product.total_qty} terjual
                      </p>
                    </div>
                  </div>

                  <p className="ml-3 shrink-0 text-sm font-bold text-slate-900">
                    {formatRupiah(product.total_sales)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================
            TRANSAKSI TERBARU
        ========================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Transaksi Terbaru
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Data transaksi terbaru dari database
              </p>
            </div>

            <a
              href="/sales"
              className="self-start rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Lihat Semua →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    No. Transaksi
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tanggal
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pelanggan
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recent_sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  data.recent_sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {sale.invoice_number}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(
                          sale.sale_date,
                        ).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {sale.customer_name}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatRupiah(
                          Number(sale.total_amount),
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}