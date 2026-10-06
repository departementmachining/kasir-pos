"use client";

import { useEffect, useState } from "react";

type Inventory = {
  id: number;
  code: string;
  name: string;
  category: string | null;
  stock: number;
  min_stock: number;
  unit: string;
  movement_total: number;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/inventory");

      if (!response.ok) {
        throw new Error("Gagal mengambil data inventory");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data inventory");
      }

      setInventory(result.data);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.code.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      (item.category || "").toLowerCase().includes(keyword)
    );
  });

  const totalProducts = inventory.length;

  const totalStock = inventory.reduce(
    (total, item) => total + Number(item.stock),
    0
  );

  const lowStock = inventory.filter(
    (item) => Number(item.stock) <= Number(item.min_stock)
  ).length;

  return (
    <div className="space-y-5">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Produk */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Produk
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {totalProducts}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Produk dalam inventory
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7.5 12 3 4 7.5m16 0v9L12 21l-8-4.5v-9m16 0-8 4.5m0 0L4 7.5m8 4.5V21"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Stok */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Stok
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-blue-600">
                {totalStock}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Jumlah seluruh stok
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h10"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stok Menipis */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Stok Menipis
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-red-600">
                {lowStock}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Produk perlu diperhatikan
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 4.6 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.5 16.5 4 4"
              />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Cari kode, nama, atau kategori produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daftar Inventory
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {filteredInventory.length} produk ditampilkan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kode
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Produk
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kategori
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stok
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Minimum
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        Memuat data inventory...
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Mohon tunggu sebentar
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.5 16.5 4 4"
                          />
                        </svg>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Tidak ada data inventory
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Coba gunakan kata kunci pencarian yang berbeda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLowStock =
                    Number(item.stock) <= Number(item.min_stock);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Kode */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                          {item.code}
                        </span>
                      </td>

                      {/* Produk */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>
                      </td>

                      {/* Kategori */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {item.category || "-"}
                        </span>
                      </td>

                      {/* Stok */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-bold ${
                            isLowStock
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>

                      {/* Minimum */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {item.min_stock}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {item.unit}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}