"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type StoreInfo = {
  name: string;
  tagline: string;
  logo: string;
  initials: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: {
    id: string;
    name: string;
  } | null;
};

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Kasir / Penjualan",
    href: "/sales",
    icon: "sales",
  },
  {
    name: "Produk",
    href: "/products",
    icon: "products",
  },
  {
    name: "Pembelian",
    href: "/purchases",
    icon: "purchases",
  },
  {
    name: "Inventory / Stok",
    href: "/inventory",
    icon: "inventory",
  },
  {
    name: "Supplier",
    href: "/suppliers",
    icon: "supplier",
  },
  {
    name: "Pelanggan",
    href: "/customers",
    icon: "customer",
  },
  {
    name: "Laporan",
    href: "/reports",
    icon: "reports",
  },
  {
    name: "Pengaturan",
    href: "/settings",
    icon: "settings",
  },
];

function MenuIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    className: "h-[18px] w-[18px]",
  };

  switch (type) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "sales":
      return (
        <svg {...common}>
          <path d="M4 17 10 11l4 4 6-8" />
          <path d="M16 7h4v4" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.5 7.5 4 7.5-4" />
          <path d="M12 11.5V21" />
        </svg>
      );

    case "purchases":
      return (
        <svg {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "inventory":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
          <path d="M7 4v16M17 4v16" />
        </svg>
      );

    case "supplier":
      return (
        <svg {...common}>
          <path d="M4 20v-8l8-7 8 7v8" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );

    case "customer":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />
        </svg>
      );

    case "reports":
      return (
        <svg {...common}>
          <path d="M5 20V10M12 20V4M19 20v-7" />
          <path d="M3 20h18" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.5A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1Z" />
        </svg>
      );

    default:
      return null;
  }
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();

  const [store, setStore] = useState<StoreInfo | null>(null);

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* =====================================================
     LOAD STORE + USER
  ===================================================== */

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

    async function loadUser() {
      try {
        setLoadingUser(true);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled && data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email ?? null,
            avatarUrl:
              data.user.avatarUrl ?? null,
            role: data.user.role ?? null,
          });
        }
      } catch (error) {
        console.error(
          "Gagal memuat user login:",
          error
        );

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    // Load pertama kali
    loadStore();
    loadUser();

    /*
      Ketika data toko disimpan dari halaman Pengaturan,
      SettingsPage akan menjalankan:

      window.dispatchEvent(
        new Event("store-updated")
      );

      Sidebar akan mengambil data terbaru otomatis.
    */
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

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] flex-col overflow-hidden bg-[#0f172a] text-white shadow-[8px_0_30px_rgba(15,23,42,0.08)] lg:flex print:hidden">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="relative flex h-[84px] shrink-0 items-center border-b border-white/[0.07] px-5">

        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

        <div className="flex min-w-0 items-center gap-3">

          {/* LOGO */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-950/30">

            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-black tracking-tight text-white">
                {store?.initials || "NT"}
              </span>
            )}

          </div>

          {/* STORE INFO */}

          <div className="min-w-0">

            <h1 className="truncate text-[17px] font-bold leading-tight tracking-tight text-white">
              {store?.name || "Nama Toko"}
            </h1>

            {store?.tagline && (
              <p className="mt-1 truncate text-[10px] font-medium tracking-wide text-slate-400">
                {store.tagline}
              </p>
            )}

          </div>

        </div>
      </div>

      {/* =================================================
          MENU
      ================================================= */}

      <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Menu Utama
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(
                  `${item.href}/`
                ));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-950/30"
                    : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100"
                }`}
              >

                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-white" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white/[0.035] text-slate-400 group-hover:bg-white/[0.07] group-hover:text-slate-200"
                  }`}
                >
                  <MenuIcon type={item.icon} />
                </span>

                <span className="truncate">
                  {item.name}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                )}

              </Link>
            );
          })}

        </div>
      </nav>

      {/* =================================================
          USER AREA
      ================================================= */}

      <div className="shrink-0 border-t border-white/[0.07] p-3">

        {loadingUser ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3">

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />

              <div className="min-w-0 flex-1 space-y-2">

                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />

                <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />

              </div>

            </div>

          </div>
        ) : user ? (
          <Link
            href="/profile"
            className="group block rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3 transition hover:border-white/10 hover:bg-white/[0.07]"
          >

            <div className="flex items-center gap-3">

              {/* AVATAR */}

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-md">

                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111827] bg-emerald-500" />

              </div>

              {/* USER INFO */}

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-semibold text-white">
                  {user.name}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {user.role?.name || "User"}
                </p>

              </div>

              {/* ARROW */}

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>

            </div>

          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="m10 17 5-5-5-5" />
                <path d="M15 12H3" />
              </svg>

            </div>

            <div>

              <p className="text-xs font-semibold text-white">
                Login
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Masuk ke sistem
              </p>

            </div>

          </Link>
        )}

      </div>
    </aside>
  );
}