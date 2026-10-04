"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // LOAD CUSTOMER
  // ===============================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Gagal mengambil data pelanggan");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Gagal mengambil data pelanggan"
        );
      }

      setCustomers(result.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pelanggan dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ===============================
  // FILTER
  // ===============================
  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.code.toLowerCase().includes(keyword) ||
      customer.name.toLowerCase().includes(keyword) ||
      (customer.phone || "")
        .toLowerCase()
        .includes(keyword) ||
      (customer.email || "")
        .toLowerCase()
        .includes(keyword) ||
      (customer.address || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // ===============================
  // RESET FORM
  // ===============================
  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingId(null);
    setError("");
  };

  // ===============================
  // TAMBAH
  // ===============================
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ===============================
  // EDIT
  // ===============================
  const openEditForm = (customer: Customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || "");
    setEmail(customer.email || "");
    setAddress(customer.address || "");
    setError("");
    setShowForm(true);
  };

  // ===============================
  // SIMPAN
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama pelanggan wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ===============================
      // EDIT
      // ===============================
      if (editingId !== null) {
        const customer = customers.find(
          (item) => item.id === editingId
        );

        if (!customer) {
          throw new Error("Pelanggan tidak ditemukan.");
        }

        const response = await fetch(
          `/api/customers/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: customer.code,
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal memperbarui pelanggan"
          );
        }

        setCustomers((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.data : item
          )
        );

        alert("Pelanggan berhasil diperbarui.");
      }

      // ===============================
      // TAMBAH
      // ===============================
      else {
        const nextCodeNumber =
          customers.reduce((max, customer) => {
            const match = customer.code.match(/^CUS(\d+)$/);

            if (!match) return max;

            return Math.max(max, Number(match[1]));
          }, 0) + 1;

        const code = `CUS${String(nextCodeNumber).padStart(
          3,
          "0"
        )}`;

        const response = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal menambahkan pelanggan"
          );
        }

        setCustomers((prev) => [result.data, ...prev]);

        alert("Pelanggan berhasil ditambahkan.");
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
    const confirmed = confirm("Hapus pelanggan ini?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menghapus pelanggan"
        );
      }

      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== id)
      );

      alert("Pelanggan berhasil dihapus.");
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus pelanggan.";

      setError(message);
      alert(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>

          <p className="text-gray-500">
            Kelola data pelanggan
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Tambah Pelanggan
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
          placeholder="Cari kode, nama, telepon, email, atau alamat..."
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
                <th className="px-5 py-4">Nama Pelanggan</th>
                <th className="px-5 py-4">Telepon</th>
                <th className="px-5 py-4">Email</th>
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
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Pelanggan tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      {customer.code}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {customer.name}
                    </td>

                    <td className="px-5 py-4">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {customer.email || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {customer.address || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            openEditForm(customer)
                          }
                          className="rounded-lg bg-yellow-100 px-3 py-2 text-yellow-700 hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(customer.id)
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
                  ? "Edit Pelanggan"
                  : "Tambah Pelanggan"}
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
                  Nama Pelanggan
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: Budi Santoso"
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
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: budi@email.com"
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
                  placeholder="Alamat pelanggan"
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