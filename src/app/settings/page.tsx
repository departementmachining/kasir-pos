"use client";

import { useEffect, useState } from "react";

type StoreSettings = {
  storeName: string;
  address: string;
  phone: string;
  logo: string;
};

export default function SettingsPage() {
  const [storeName, setStoreName] =
    useState("Kasir POS");

  const [address, setAddress] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [logo, setLogo] =
    useState("");

  useEffect(() => {
    const savedSettings =
      localStorage.getItem(
        "storeSettings"
      );

    if (!savedSettings) {
      return;
    }

    try {
      const settings: StoreSettings =
        JSON.parse(savedSettings);

      setStoreName(
        settings.storeName ||
          "Kasir POS"
      );

      setAddress(
        settings.address || ""
      );

      setPhone(
        settings.phone || ""
      );

      setLogo(
        settings.logo || ""
      );
    } catch (error) {
      console.error(
        "Gagal membaca pengaturan toko:",
        error
      );
    }
  }, []);

  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "File logo harus berupa gambar."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Ukuran logo maksimal 2 MB."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result ===
        "string"
      ) {
        setLogo(result);
      }
    };

    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo("");
  };

  const saveSettings = () => {
    const settings: StoreSettings =
      {
        storeName,
        address,
        phone,
        logo,
      };

    localStorage.setItem(
      "storeSettings",
      JSON.stringify(settings)
    );

    alert(
      "Pengaturan toko berhasil disimpan."
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Pengaturan Toko
        </h1>

        <p className="text-gray-500">
          Atur informasi toko dan logo
          yang akan ditampilkan pada
          struk.
        </p>
      </div>

      {/* FORM */}
      <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">

        <div className="space-y-5">

          {/* NAMA TOKO */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Nama Toko
            </label>

            <input
              type="text"
              value={storeName}
              onChange={(e) =>
                setStoreName(
                  e.target.value
                )
              }
              placeholder="Masukkan nama toko"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* ALAMAT */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Alamat Toko
            </label>

            <textarea
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="Masukkan alamat toko"
              rows={3}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* TELEPON */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Nomor Telepon
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Contoh: 08123456789"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* LOGO */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Logo Toko
            </label>

            <div className="rounded-xl border border-dashed p-5">

              {logo ? (
                <div className="space-y-4">

                  <div className="flex justify-center">

                    <div className="flex h-32 w-32 items-center justify-center rounded-xl border bg-gray-50 p-3">

                      <img
                        src={logo}
                        alt="Logo toko"
                        className="max-h-full max-w-full object-contain"
                      />

                    </div>

                  </div>

                  <div className="flex justify-center gap-3">

                    <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">

                      Ganti Logo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleLogoChange
                        }
                        className="hidden"
                      />

                    </label>

                    <button
                      type="button"
                      onClick={
                        removeLogo
                      }
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      Hapus Logo
                    </button>

                  </div>

                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center py-8 text-center">

                  <div className="mb-3 text-4xl">
                    🖼️
                  </div>

                  <p className="font-medium">
                    Pilih Logo Toko
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, JPEG maksimal
                    2 MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleLogoChange
                    }
                    className="hidden"
                  />

                </label>
              )}

            </div>

          </div>

          {/* SIMPAN */}
          <button
            onClick={
              saveSettings
            }
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Simpan Pengaturan
          </button>

        </div>

      </div>

    </div>
  );
}