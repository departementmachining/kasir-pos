"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock?: number;
  unit?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // ===============================
  // AMBIL DATA PRODUK
  // ===============================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data produk");
      }

      setProducts(result.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data produk dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ===============================
  // FILTER PRODUK
  // ===============================

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase()) ||
      (product.category || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ===============================
  // BUKA FORM TAMBAH
  // ===============================

  const openAddForm = () => {
    setEditingId(null);

    setName("");
    setCategory("");
    setPrice("");
    setStock("");

    setError("");
    setShowForm(true);
  };

  // ===============================
  // BUKA FORM EDIT
  // ===============================

  const openEditForm = (product: Product) => {
    setEditingId(product.id);

    setName(product.name);
    setCategory(product.category || "");
    setPrice(String(product.price));
    setStock(String(product.stock));

    setError("");
    setShowForm(true);
  };

  // ===============================
  // SIMPAN PRODUK
  // ===============================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || !price || !stock) {
      alert("Semua data produk wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ===============================
      // EDIT PRODUK
      // ===============================

      if (editingId !== null) {
        const product = products.find(
          (item) => item.id === editingId
        );

        if (!product) {
          throw new Error("Produk tidak ditemukan.");
        }

        const response = await fetch(
          `/api/products/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: product.code,
              name,
              category,
              price: Number(price),
              stock: Number(stock),
              min_stock: product.min_stock || 0,
              unit: product.unit || "pcs",
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal memperbarui produk"
          );
        }

        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.data : item
          )
        );

        alert("Produk berhasil diperbarui.");
      }

      // ===============================
      // TAMBAH PRODUK
      // ===============================

      else {
        const nextCodeNumber =
          products.reduce((max, product) => {
            const match = product.code.match(/^PRD(\d+)$/);

            if (!match) return max;

            return Math.max(max, Number(match[1]));
          }, 0) + 1;

        const code = `PRD${String(nextCodeNumber).padStart(
          3,
          "0"
        )}`;

        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            name,
            category,
            price: Number(price),
            stock: Number(stock),
            min_stock: 0,
            unit: "pcs",
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal menambahkan produk"
          );
        }

        setProducts((prev) => [result.data, ...prev]);

        alert("Produk berhasil ditambahkan.");
      }

      setName("");
      setCategory("");
      setPrice("");
      setStock("");
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.";

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // HAPUS PRODUK
  // ===============================

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Hapus produk ini?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menghapus produk"
        );
      }

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

      alert("Produk berhasil dihapus.");
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus produk.";

      setError(message);
      alert(message);
    }
  };

  return (
    <div className="space-y-5">
      {/* TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Cari kode, nama produk, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Produk
          </button>
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
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Produk
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Kelola katalog produk dan stok barang
            </p>
          </div>

          <span className="hidden rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
            {filteredProducts.length} produk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500 sm:px-6">
                  Kode
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Produk
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Kategori
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Harga
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Stok
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center sm:px-6"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                      <span className="mt-3 text-sm font-medium text-slate-500">
                        Memuat data produk...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center sm:px-6"
                  >
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M6 3h12l3 5v13H3V8l3-5Z" />
                          <path d="M3 8h18M9 12h6" />
                        </svg>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Produk tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Coba gunakan kata kunci pencarian yang berbeda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                        {product.code}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {product.name}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {product.category || "-"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatRupiah(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          product.stock <= 10
                            ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100"
                        }`}
                      >
                        {product.stock} {product.unit || "pcs"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-50"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                          </svg>
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-50"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 7h16M10 11v6M14 11v6" />
                            <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null
                    ? "Edit Produk"
                    : "Tambah Produk"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingId !== null
                    ? "Perbarui informasi produk"
                    : "Tambahkan produk baru ke katalog"}
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 px-5 py-5 sm:px-6"
            >
              {/* NAMA */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nama Produk
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Contoh: Indomie Goreng"
                />
              </div>

              {/* KATEGORI */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Kategori
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Contoh: Makanan"
                />
              </div>

              {/* HARGA */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Harga Jual
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="3500"
                  min="0"
                />
              </div>

              {/* STOK */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Stok
                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="10"
                  min="0"
                />
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId !== null
                      ? "Simpan Perubahan"
                      : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}