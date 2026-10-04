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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory / Stok
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitoring stok produk dan pergerakan inventory
        </p>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Produk</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Stok</p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalStock}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Stok Menipis</p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {lowStock}
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Cari kode, nama, atau kategori produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Kode
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Produk
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Kategori
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Stok
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Minimum
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Unit
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Memuat data inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Tidak ada data inventory
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLowStock =
                    Number(item.stock) <= Number(item.min_stock);

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {item.code}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {item.name}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.category || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`font-bold ${
                            isLowStock
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.min_stock}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.unit}
                      </td>

                      <td className="px-4 py-4">
                        {isLowStock ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
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