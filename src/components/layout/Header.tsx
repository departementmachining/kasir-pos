"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StoreInfo = {
  name: string;
  tagline: string;
  logo: string;
  initials: string;
};

const pageInfo: Record<
  string,
  { title: string; description: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Ringkasan aktivitas hari ini",
  },
  "/products": {
    title: "Produk",
    description: "Kelola produk dan katalog barang",
  },
  "/sales": {
    title: "Penjualan",
    description: "Kelola dan pantau transaksi penjualan",
  },
  "/purchases": {
    title: "Pembelian",
    description: "Kelola transaksi pembelian barang",
  },
  "/inventory": {
    title: "Inventory / Stok",
    description: "Kelola persediaan dan stok barang",
  },
  "/customers": {
    title: "Pelanggan",
    description: "Kelola data pelanggan",
  },
  "/suppliers": {
    title: "Supplier",
    description: "Kelola data supplier",
  },
  "/reports": {
    title: "Laporan",
    description: "Lihat laporan dan analisis bisnis",
  },
  "/settings": {
    title: "Pengaturan",
    description: "Kelola pengaturan sistem",
  },
};

function getPageInfo(pathname: string) {
  if (pageInfo[pathname]) {
    return pageInfo[pathname];
  }

  if (pathname.startsWith("/products/")) {
    return pageInfo["/products"];
  }

  if (pathname.startsWith("/sales/")) {
    return pageInfo["/sales"];
  }

  if (pathname.startsWith("/purchases/")) {
    return pageInfo["/purchases"];
  }

  if (pathname.startsWith("/inventory/")) {
    return pageInfo["/inventory"];
  }

  if (pathname.startsWith("/customers/")) {
    return pageInfo["/customers"];
  }

  if (pathname.startsWith("/suppliers/")) {
    return pageInfo["/suppliers"];
  }

  return {
    title: "Dashboard",
    description: "Sistem Point of Sale",
  };
}

/* =========================
   ICONS
========================= */

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[19px] w-[19px]"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[17px] w-[17px]"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1.9-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[17px] w-[17px]"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[17px] w-[17px]"
    >
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M9 12h9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================
   HEADER
========================= */

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = getPageInfo(pathname);

  const [store, setStore] = useState<StoreInfo | null>(null);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Selamat datang",
      message: "Anda login sebagai Administrator.",
      time: "Baru saja",
      unread: true,
    },
    {
      id: 2,
      title: "Sistem berjalan normal",
      message:
        "Semua layanan sistem berjalan dengan baik.",
      time: "Hari ini",
      unread: true,
    },
    {
      id: 3,
      title: "Database tersambung",
      message:
        "Koneksi database aktif dan siap digunakan.",
      time: "Hari ini",
      unread: false,
    },
  ]);

  const headerRef = useRef<HTMLDivElement>(null);

  /* =========================
     LOAD STORE
  ========================= */

  useEffect(() => {
    let cancelled = false;

    async function loadStore() {
      try {
        const response = await fetch("/api/store", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        const responseText = await response.text();

        let data: {
          store?: {
            name?: string;
            tagline?: string;
            logo?: string;
            initials?: string;
          };
          message?: string;
          error?: string;
        } = {};

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

        if (!response.ok || !data.store) {
          throw new Error(
            data.error ||
              data.message ||
              "Gagal mengambil data toko"
          );
        }

        if (cancelled) {
          return;
        }

        const storeData = data.store;

        setStore({
          name:
            typeof storeData.name === "string" &&
            storeData.name.trim()
              ? storeData.name.trim()
              : "Nama Toko",

          tagline:
            typeof storeData.tagline === "string"
              ? storeData.tagline.trim()
              : "",

          logo:
            typeof storeData.logo === "string"
              ? storeData.logo.trim()
              : "",

          initials:
            typeof storeData.initials === "string" &&
            storeData.initials.trim()
              ? storeData.initials.trim()
              : "NT",
        });
      } catch (error) {
        console.error(
          "Gagal memuat identitas toko:",
          error
        );

        if (!cancelled) {
          setStore({
            name: "Nama Toko",
            tagline: "",
            logo: "",
            initials: "NT",
          });
        }
      }
    }

    // Load pertama kali
    loadStore();

    // Load ulang ketika pengaturan toko berhasil disimpan
    const handleStoreUpdated = () => {
      loadStore();
    };

    window.addEventListener(
      "store-updated",
      handleStoreUpdated
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "store-updated",
        handleStoreUpdated
      );
    };
  }, []);

  /* =========================
     CLICK OUTSIDE
  ========================= */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(
          event.target as Node
        )
      ) {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================
     DROPDOWN
  ========================= */

  const toggleNotification = () => {
    setNotificationOpen((current) => !current);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((current) => !current);
    setNotificationOpen(false);
  };

  /* =========================
     NOTIFICATION
  ========================= */

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  /* =========================
     NAVIGATION
  ========================= */

  const goTo = (path: string) => {
    setProfileOpen(false);
    setNotificationOpen(false);
    router.push(path);
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      setProfileOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl lg:left-[250px]"
    >
      <div className="flex min-h-[84px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* =========================
            LEFT
        ========================= */}

        <div className="min-w-0 py-3">
          {/* STORE IDENTITY */}

          <div className="flex min-w-0 items-center gap-2.5">
            {/* LOGO */}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm">
              {store?.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-black tracking-tight text-white">
                  {store?.initials || "NT"}
                </span>
              )}
            </div>

            {/* STORE NAME */}

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                <span className="max-w-[180px] truncate text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:max-w-[260px] sm:text-[11px]">
                  {store?.name || "Nama Toko"}
                </span>
              </div>

              {store?.tagline && (
                <p className="mt-0.5 max-w-[220px] truncate text-[9px] text-slate-400 sm:max-w-[300px]">
                  {store.tagline}
                </p>
              )}
            </div>
          </div>

          {/* PAGE TITLE */}

          <h1 className="mt-1.5 truncate text-[20px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[22px]">
            {currentPage.title}
          </h1>

          <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block sm:text-sm">
            {currentPage.description}
          </p>
        </div>

        {/* =========================
            RIGHT
        ========================= */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* ONLINE */}

          <div className="hidden h-10 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            Online
          </div>

          {/* NOTIFICATION */}

          <div className="relative">
            <button
              type="button"
              aria-label="Notifikasi"
              aria-expanded={notificationOpen}
              onClick={toggleNotification}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                notificationOpen
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BellIcon />

              {unreadCount > 0 && (
                <>
                  <span className="absolute right-[8px] top-[7px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* NOTIFICATION PANEL */}

            {notificationOpen && (
              <div className="absolute right-0 top-[52px] w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Notifikasi
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Informasi sistem terbaru
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        markAllNotificationsAsRead
                      }
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      <CheckIcon />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-[330px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <BellIcon />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        Tidak ada notifikasi
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Semua informasi akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          setNotifications(
                            (current) =>
                              current.map((item) =>
                                item.id ===
                                notification.id
                                  ? {
                                      ...item,
                                      unread: false,
                                    }
                                  : item
                              )
                          );
                        }}
                        className="flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <BellIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-800">
                              {notification.title}
                            </p>

                            {notification.unread && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                            {notification.message}
                          </p>

                          <p className="mt-1.5 text-[10px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(false);
                    }}
                    className="w-full rounded-lg py-1.5 text-center text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ADMINISTRATOR PROFILE */}

          <div className="relative">
            <button
              type="button"
              aria-label="Administrator"
              aria-expanded={profileOpen}
              onClick={toggleProfile}
              className={`group flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 ${
                profileOpen
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                A
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-xs font-semibold leading-tight text-slate-800">
                  Admin
                </p>

                <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-400">
                  Administrator
                </p>
              </div>

              <span
                className={`hidden text-slate-400 transition sm:block ${
                  profileOpen
                    ? "rotate-180 text-slate-600"
                    : "group-hover:text-slate-600"
                }`}
              >
                <ChevronDownIcon />
              </span>
            </button>

            {/* PROFILE MENU */}

            {profileOpen && (
              <div className="absolute right-0 top-[52px] w-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-sm">
                      A
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        Administrator
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        Admin
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() =>
                      goTo("/dashboard")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <DashboardIcon />
                    </span>

                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("/settings")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <SettingsIcon />
                    </span>

                    <span>Pengaturan</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <LogOutIcon />
                    </span>

                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}