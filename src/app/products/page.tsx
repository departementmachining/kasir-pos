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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>

          <p className="text-gray-500">
            Kelola produk dan stok barang
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Tambah Produk
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Cari kode, nama produk, atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4">Kode</th>
                <th className="px-5 py-4">Produk</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Harga</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4 text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Memuat data produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Produk tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      {product.code}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {product.name}
                    </td>

                    <td className="px-5 py-4">
                      {product.category || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {formatRupiah(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.stock <= 10
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock}{" "}
                        {product.unit || "pcs"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            openEditForm(product)
                          }
                          className="rounded-lg bg-yellow-100 px-3 py-2 text-yellow-700 hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                        >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {/* MODAL HEADER */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId !== null
                  ? "Edit Produk"
                  : "Tambah Produk"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* NAMA */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Produk
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: Indomie Goreng"
                />
              </div>

              {/* KATEGORI */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kategori
                </label>

                <input
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: Makanan"
                />
              </div>

              {/* HARGA */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Harga Jual
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="3500"
                  min="0"
                />
              </div>

              {/* STOK */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Stok
                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="10"
                  min="0"
                />
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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