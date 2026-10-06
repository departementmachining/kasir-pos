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

  // ==========================================
  // LOAD DATA SUPPLIER
  // ==========================================
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/suppliers");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data supplier",
        );
      }

      setSuppliers(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data supplier dari database.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ==========================================
  // FILTER SUPPLIER
  // ==========================================
  const filteredSuppliers = suppliers.filter((supplier) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      supplier.code.toLowerCase().includes(keyword) ||
      supplier.name.toLowerCase().includes(keyword) ||
      (supplier.contact || "").toLowerCase().includes(keyword) ||
      (supplier.phone || "").toLowerCase().includes(keyword) ||
      (supplier.address || "").toLowerCase().includes(keyword)
    );
  });

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setName("");
    setContact("");
    setPhone("");
    setAddress("");
    setEditingId(null);
    setError("");
  };

  // ==========================================
  // OPEN ADD
  // ==========================================
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================
  const openEditForm = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setName(supplier.name);
    setContact(supplier.contact || "");
    setPhone(supplier.phone || "");
    setAddress(supplier.address || "");
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================
  const closeForm = () => {
    if (saving) return;

    resetForm();
    setShowForm(false);
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nama supplier wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ========================================
      // EDIT SUPPLIER
      // ========================================
      if (editingId !== null) {
        const supplier = suppliers.find(
          (item) => item.id === editingId,
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
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal memperbarui supplier",
          );
        }

        setSuppliers((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.data : item,
          ),
        );
      }

      // ========================================
      // TAMBAH SUPPLIER
      // ========================================
      else {
        const nextCodeNumber =
          suppliers.reduce((max, supplier) => {
            const match = supplier.code.match(/^SUP(\d+)$/);

            if (!match) return max;

            return Math.max(max, Number(match[1]));
          }, 0) + 1;

        const code = `SUP${String(nextCodeNumber).padStart(
          3,
          "0",
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
            result.message || "Gagal menambahkan supplier",
          );
        }

        setSuppliers((prev) => [result.data, ...prev]);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE SUPPLIER
  // ==========================================
  const handleDelete = async (id: number) => {
    const confirmed = confirm(
      "Apakah kamu yakin ingin menghapus supplier ini?",
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menghapus supplier",
        );
      }

      setSuppliers((prev) =>
        prev.filter((supplier) => supplier.id !== id),
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus supplier.",
      );
    }
  };

  return (
    <div className="text-slate-900">
      <main className="space-y-6">

        {/* =====================================
            DAFTAR SUPPLIER + TAMBAH
        ====================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Daftar Supplier
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Cari data supplier berdasarkan kode, nama,
                kontak, telepon, atau alamat.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Tambah Supplier
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative mt-5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari supplier..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-xl text-slate-400 transition hover:text-slate-700"
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* =====================================
            ERROR
        ====================================== */}
        {error && !showForm && (
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.7 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-red-700">
                  Terjadi Kesalahan
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadSuppliers}
                  className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================
            TABLE
        ====================================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Data Supplier
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Supplier yang tersimpan di database.
              </p>
            </div>

            <div className="self-start rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              {filteredSuppliers.length} supplier
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kode
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nama Supplier
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kontak
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Telepon
                  </th>

                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Alamat
                  </th>

                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Memuat data supplier...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  /* EMPTY */
                  <tr>
                    <td colSpan={6} className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          {search
                            ? "Supplier tidak ditemukan"
                            : "Belum ada supplier"}
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-400">
                          {search
                            ? "Coba gunakan kata kunci pencarian yang berbeda."
                            : "Tambahkan supplier pertama untuk mulai mengelola data supplier."}
                        </p>

                        {!search && (
                          <button
                            type="button"
                            onClick={openAddForm}
                            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            + Tambah Supplier
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* DATA */
                  filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      {/* KODE */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-100">
                          {supplier.code}
                        </span>
                      </td>

                      {/* NAMA */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {supplier.name}
                        </p>
                      </td>

                      {/* KONTAK */}
                      <td className="px-5 py-4 text-slate-600">
                        {supplier.contact || (
                          <span className="text-slate-300">
                            -
                          </span>
                        )}
                      </td>

                      {/* TELEPON */}
                      <td className="px-5 py-4 text-slate-600">
                        {supplier.phone || (
                          <span className="text-slate-300">
                            -
                          </span>
                        )}
                      </td>

                      {/* ALAMAT */}
                      <td className="max-w-[300px] px-5 py-4">
                        <p className="truncate text-slate-600">
                          {supplier.address || (
                            <span className="text-slate-300">
                              -
                            </span>
                          )}
                        </p>
                      </td>

                      {/* AKSI */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(supplier)
                            }
                            className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100 transition hover:bg-amber-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(supplier.id)
                            }
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-100 transition hover:bg-red-100"
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
        </section>
      </main>

      {/* =====================================
          MODAL TAMBAH / EDIT
      ====================================== */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId !== null
                      ? "Edit Supplier"
                      : "Tambah Supplier"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingId !== null
                      ? "Perbarui informasi supplier."
                      : "Masukkan informasi supplier baru."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* NAMA SUPPLIER */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Supplier
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={saving}
                  required
                  autoFocus
                  placeholder="Contoh: PT Sumber Makmur"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* KONTAK */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Kontak
                </label>

                <input
                  type="text"
                  value={contact}
                  onChange={(e) =>
                    setContact(e.target.value)
                  }
                  disabled={saving}
                  placeholder="Contoh: Budi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* TELEPON */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor Telepon
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  disabled={saving}
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* ALAMAT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Alamat
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  disabled={saving}
                  rows={4}
                  placeholder="Alamat lengkap supplier"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* ACTION */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Menyimpan...
                    </>
                  ) : editingId !== null ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan Supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}