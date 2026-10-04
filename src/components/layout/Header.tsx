"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

    const pageName =
        pathname === "/dashboard"
              ? "Dashboard"
                    : pathname === "/products"
                          ? "Produk"
                                : pathname === "/sales"
                                      ? "Penjualan"
                                            : pathname === "/purchases"
                                                  ? "Pembelian"
                                                        : pathname === "/customers"
                                                              ? "Pelanggan"
                                                                    : pathname === "/reports"
                                                                          ? "Laporan"
                                                                                : "Kasir POS";

                                                                                  return (
                                                                                      <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
                                                                                            <h2 className="text-lg font-semibold">{pageName}</h2>

                                                                                                  <div className="flex items-center gap-4">
                                                                                                          <button className="rounded-lg p-2 hover:bg-gray-100">
                                                                                                                    🔔
                                                                                                                            </button>

                                                                                                                                    <div className="flex items-center gap-2">
                                                                                                                                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                                                                                                                                                          A
                                                                                                                                                                    </div>
                                                                                                                                                                              <span className="font-medium">Admin</span>
                                                                                                                                                                                      </div>
                                                                                                                                                                                            </div>
                                                                                                                                                                                                </header>
                                                                                                                                                                                                  );
                                                                                                                                                                                                  }