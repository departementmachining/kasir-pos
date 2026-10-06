"use client";

import { useEffect, useState } from "react";

type StoreSettings = {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  logo: string;
};

type StoreResponse = {
  store?: {
    name?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    logo?: string;
    initials?: string;
  };
  message?: string;
  error?: string;
};

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /* ========================================
     LOAD DATA TOKO
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        setSaved(false);

        const response = await fetch("/api/store", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        const responseText = await response.text();

        let data: StoreResponse = {};

        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              "Response GET /api/store bukan JSON valid:",
              responseText,
              parseError
            );

            throw new Error(
              `Server mengembalikan response yang bukan JSON. HTTP ${response.status}.`
            );
          }
        } else {
          throw new Error(
            `Server mengembalikan response kosong. HTTP ${response.status}.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              `Gagal mengambil data toko. HTTP ${response.status}.`
          );
        }

        if (!data.store) {
          throw new Error(
            data.message ||
              "Data toko belum tersedia."
          );
        }

        if (cancelled) {
          return;
        }

        setStoreName(
          typeof data.store.name === "string"
            ? data.store.name
            : ""
        );

        setTagline(
          typeof data.store.tagline === "string"
            ? data.store.tagline
            : ""
        );

        setAddress(
          typeof data.store.address === "string"
            ? data.store.address
            : ""
        );

        setPhone(
          typeof data.store.phone === "string"
            ? data.store.phone
            : ""
        );

        setLogo(
          typeof data.store.logo === "string"
            ? data.store.logo
            : ""
        );
      } catch (err) {
        console.error(
          "Gagal memuat pengaturan toko:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat pengaturan toko."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ========================================
     LOGO
  ======================================== */

  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File logo harus berupa gambar.");

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo maksimal 2 MB.");

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setLogo(result);
        setSaved(false);
        setError("");
      }
    };

    reader.onerror = () => {
      setError("Gagal membaca file logo.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeLogo = () => {
    setLogo("");
    setSaved(false);
    setError("");
  };

  /* ========================================
     SAVE SETTINGS
  ======================================== */

  const saveSettings = async () => {
    if (!storeName.trim()) {
      alert("Nama toko wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const settings: StoreSettings = {
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        address: address.trim(),
        phone: phone.trim(),
        logo,
      };

      const response = await fetch("/api/store", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(settings),
      });

      const responseText = await response.text();

      let data: StoreResponse = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Response PUT /api/store bukan JSON valid:",
            responseText,
            parseError
          );

          throw new Error(
            `Server mengembalikan response yang bukan JSON. HTTP ${response.status}.`
          );
        }
      } else {
        throw new Error(
          `Server mengembalikan response kosong. HTTP ${response.status}.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Gagal menyimpan pengaturan toko. HTTP ${response.status}.`
        );
      }

      if (data.store) {
        setStoreName(data.store.name || "");
        setTagline(data.store.tagline || "");
        setAddress(data.store.address || "");
        setPhone(data.store.phone || "");
        setLogo(data.store.logo || "");
      }

      /*
       * Beritahu Header dan Sidebar bahwa
       * data toko sudah berubah.
       */
      window.dispatchEvent(new Event("store-updated"));

      setSaved(true);
    } catch (err) {
      console.error(
        "Gagal menyimpan pengaturan toko:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengaturan toko."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-72 rounded bg-slate-100" />
          </div>
        </div>

        <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-40 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-800">
            Informasi Toko
          </h2>

          <p className="text-sm text-slate-500">
            Atur informasi toko yang digunakan
            pada aplikasi dan ditampilkan pada
            struk transaksi.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-700">
                Terjadi kesalahan
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-800">
            Detail Toko
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Lengkapi informasi toko Anda.
          </p>
        </div>

        <div className="space-y-6 p-5">
          <div>
            <label
              htmlFor="storeName"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nama Toko
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Masukkan nama toko"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Nama toko yang akan ditampilkan
              pada aplikasi dan struk.
            </p>
          </div>

          <div>
            <label
              htmlFor="tagline"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Tagline Toko
            </label>

            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Contoh: Solusi Belanja Terbaik"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Tagline akan ditampilkan pada
              Sidebar dan Header.
            </p>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Alamat Toko
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Masukkan alamat toko"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Alamat lengkap toko untuk
              ditampilkan pada struk.
            </p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nomor Telepon
            </label>

            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Contoh: 08123456789"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Nomor telepon yang akan
              ditampilkan pada struk.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Logo Toko
            </label>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
              {logo ? (
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <img
                        src={logo}
                        alt="Logo toko"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Logo Toko
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Logo akan digunakan pada
                      identitas toko dan struk.
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-2 sm:flex-row">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
                      Ganti Logo

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={removeLogo}
                      className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-100 transition hover:bg-red-100"
                    >
                      Hapus Logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-inset ring-slate-200">
                    🖼️
                  </div>

                  <p className="font-semibold text-slate-700">
                    Pilih Logo Toko
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                    Upload logo toko dalam
                    format PNG, JPG, JPEG,
                    atau WEBP.
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Maksimal ukuran 2 MB
                  </p>

                  <span className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    Pilih File
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {saved ? (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">
                    ✓
                  </span>

                  Pengaturan berhasil disimpan
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Perubahan akan tersimpan
                  di database.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}