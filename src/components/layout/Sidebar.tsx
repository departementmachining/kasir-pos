"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Kasir / Penjualan", href: "/sales", icon: "🛒" },
  { name: "Produk", href: "/products", icon: "📦" },
  { name: "Pembelian", href: "/purchases", icon: "📥" },
  { name: "Inventory / Stok", href: "/inventory", icon: "📋" },
  { name: "Supplier", href: "/suppliers", icon: "🏢" },
  { name: "Pelanggan", href: "/customers", icon: "👥" },
  { name: "Laporan", href: "/reports", icon: "📈" },
  { name: "Pengaturan", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white print:hidden">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Kasir POS</h1>
      </div>

      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}