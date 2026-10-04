"use client";

import { useEffect, useState } from "react";

type Supplier = {
  id: number;
  code: string;
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // LOAD SUPPLIER
  // ===============================
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/suppliers");

      if (!response.ok) {
        throw new Error("Gagal mengambil data supplier");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Gagal mengambil data supplier"
        );
      }

      setSuppliers(result.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data supplier dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ===============================
  // FILTER
  // ===============================
  const filteredSuppliers = suppliers.filter((supplier) => {
    const keyword = search.toLowerCase();

    return (
      supplier.code.toLowerCase().includes(keyword) ||
      supplier.name.toLowerCase().includes(keyword) ||
      (supplier.contact || "")
        .toLowerCase()
        .includes(keyword) ||
      (supplier.phone || "")
        .toLowerCase()
        .includes(keyword) ||
      (supplier.address || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // ===============================
  // RESET FORM
  // ===============================
  const resetForm = () => {
    setName("");
    setContact("");
    setPhone("");
    setAddress("");
    setEditingId(null);
    setError("");
  };

  // ===============================
  // TAMBAH SUPPLIER
  // ===============================
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ===============================
  // EDIT SUPPLIER
  // ===============================
  const openEditForm = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setName(supplier.name);
    setContact(supplier.contact || "");
    setPhone(supplier.phone || "");
    setAddress(supplier.address || "");
    setError("");
    setShowForm(true);
  };

  // ===============================
  // SIMPAN
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama supplier wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ===============================
      // EDIT
      // ===============================
      if (editingId !== null) {
        const supplier = suppliers.find(
          (item) => item.id === editingId
        );

        if (!supplier) {
          throw new Error("Supplier tidak ditemukan.");
        }

        const response = await fetch(
          `/api/suppliers/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: supplier.code,
              name: name.trim(),
              contact: contact.trim(),
              phone: phone.trim(),
              address: address.trim(),
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal memperbarui supplier"
          );
        }

        setSuppliers((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.data : item
          )
        );

        alert("Supplier berhasil diperbarui.");
      }

      // ===============================
      // TAMBAH
      // ===============================
      else {
        const nextCodeNumber =
          suppliers.reduce((max, supplier) => {
            const match = supplier.code.match(/^SUP(\d+)$/);

            if (!match) return max;

            return Math.max(max, Number(match[1]));
          }, 0) + 1;

        const code = `SUP${String(nextCodeNumber).padStart(
          3,
          "0"
        )}`;

        const response = await fetch("/api/suppliers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            name: name.trim(),
            contact: contact.trim(),
            phone: phone.trim(),
            address: address.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal menambahkan supplier"
          );
        }

        setSuppliers((prev) => [result.data, ...prev]);

        alert("Supplier berhasil ditambahkan.");
      }

      resetForm();
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
  // DELETE
  // ===============================
  const handleDelete = async (id: number) => {
    const confirmed = confirm("Hapus supplier ini?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menghapus supplier"
        );
      }

      setSuppliers((prev) =>
        prev.filter((supplier) => supplier.id !== id)
      );

      alert("Supplier berhasil dihapus.");
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus supplier.";

      setError(message);
      alert(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Supplier</h1>

          <p className="text-gray-500">
            Kelola data supplier barang
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Tambah Supplier
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
          placeholder="Cari kode, nama, kontak, telepon, atau alamat..."
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
                <th className="px-5 py-4">Nama Supplier</th>
                <th className="px-5 py-4">Kontak</th>
                <th className="px-5 py-4">Telepon</th>
                <th className="px-5 py-4">Alamat</th>
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
                    Memuat data supplier...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Supplier tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      {supplier.code}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {supplier.name}
                    </td>

                    <td className="px-5 py-4">
                      {supplier.contact || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {supplier.phone || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {supplier.address || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            openEditForm(supplier)
                          }
                          className="rounded-lg bg-yellow-100 px-3 py-2 text-yellow-700 hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(supplier.id)
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

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId !== null
                  ? "Edit Supplier"
                  : "Tambah Supplier"}
              </h2>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
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
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Supplier
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: PT Sumber Makmur"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Kontak
                </label>

                <input
                  value={contact}
                  onChange={(e) =>
                    setContact(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: Budi"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Telepon
                </label>

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Alamat
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Alamat supplier"
                  rows={3}
                />
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
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