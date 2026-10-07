"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  code: string;
  name: string;
  category?: string | null;
  price: number;
  stock: number;
};

type Customer = {
  id: number;
  code: string;
  name: string;
};

type CartItem = Product & {
  qty: number;
};

type Sale = {
  id: number;
  invoice_number: string;
  sale_date: string;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_method: string;
  status: string;
  customer_name: string;
};

type ReceiptItem = {
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
};

type LastTransaction = {
  invoice: string;
  total: number;
  paid: number;
  change: number;
  paymentMethod: string;
  customer: string;
  cashier: string;
  date: string;
  time: string;
  items: ReceiptItem[];
};

type StoreSettings = {
  storeName: string;
  address: string;
  phone: string;
  logo: string;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [payment, setPayment] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState(false);

  const [printingId, setPrintingId] =
    useState<number | null>(null);

  const [printing, setPrinting] =
    useState(false);

  const [error, setError] = useState("");

  const [lastTransaction, setLastTransaction] =
    useState<LastTransaction | null>(null);

  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>({
      storeName: "",
      address: "",
      phone: "",
      logo: "",
    });

  /*
   * ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsRes,
        customersRes,
        salesRes,
      ] = await Promise.all([
        fetch("/api/products", {
          cache: "no-store",
        }),

        fetch("/api/customers", {
          cache: "no-store",
        }),

        fetch("/api/sales", {
          cache: "no-store",
        }),
      ]);

      const productsData =
        await productsRes.json();

      const customersData =
        await customersRes.json();

      const salesData =
        await salesRes.json();

      if (
        !productsRes.ok ||
        !productsData.success
      ) {
        throw new Error(
          productsData.message ||
            "Gagal mengambil data produk",
        );
      }

      if (
        !customersRes.ok ||
        !customersData.success
      ) {
        throw new Error(
          customersData.message ||
            "Gagal mengambil data pelanggan",
        );
      }

      if (
        !salesRes.ok ||
        !salesData.success
      ) {
        throw new Error(
          salesData.message ||
            "Gagal mengambil data penjualan",
        );
      }

      setProducts(
        productsData.data || [],
      );

      setCustomers(
        customersData.data || [],
      );

      setSales(
        salesData.data || [],
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
   * ==========================================================
   * LOAD STORE SETTINGS
   * ==========================================================
   */

  const loadStoreSettings = async () => {
    try {
      const response = await fetch(
        "/api/store",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Gagal mengambil pengaturan toko",
        );
      }

      const store = data.data;

      const settings: StoreSettings = {
        storeName:
          typeof store?.name === "string"
            ? store.name.trim()
            : "",

        address:
          typeof store?.address === "string"
            ? store.address.trim()
            : "",

        phone:
          typeof store?.phone === "string"
            ? store.phone.trim()
            : "",

        logo:
          typeof store?.logo === "string"
            ? store.logo.trim()
            : "",
      };

      setStoreSettings(settings);

      return settings;
    } catch (err) {
      console.error(
        "Gagal mengambil pengaturan toko:",
        err,
      );

      setStoreSettings({
        storeName: "",
        address: "",
        phone: "",
        logo: "",
      });

      return null;
    }
  };

  useEffect(() => {
    loadStoreSettings();

    const handleStoreUpdated = () => {
      loadStoreSettings();
    };

    window.addEventListener(
      "store-updated",
      handleStoreUpdated,
    );

    return () => {
      window.removeEventListener(
        "store-updated",
        handleStoreUpdated,
      );
    };
  }, []);

  /*
   * ==========================================================
   * AFTER PRINT
   * ==========================================================
   */

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove(
        "printing-receipt",
      );

      setPrinting(false);
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint,
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint,
      );

      document.body.classList.remove(
        "printing-receipt",
      );
    };
  }, []);

  /*
   * ==========================================================
   * FILTER PRODUCT
   * ==========================================================
   */

  const filteredProducts = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(keyword) ||
        product.code
          .toLowerCase()
          .includes(keyword),
    );
  }, [products, search]);

  /*
   * ==========================================================
   * TOTAL
   * ==========================================================
   */

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          item.price * item.qty,
        0,
      ),
    [cart],
  );

  const paidAmount =
    Number(payment) || 0;

  const change =
    paidAmount - total;

  /*
   * ==========================================================
   * CART
   * ==========================================================
   */

  const addToCart = (
    product: Product,
  ) => {
    if (product.stock <= 0) {
      alert("Stok produk habis.");
      return;
    }

    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === product.id,
        );

      if (!existing) {
        return [
          ...current,
          {
            ...product,
            qty: 1,
          },
        ];
      }

      if (
        existing.qty >=
        product.stock
      ) {
        alert(
          "Jumlah melebihi stok.",
        );

        return current;
      }

      return current.map(
        (item) =>
          item.id === product.id
            ? {
                ...item,
                qty:
                  item.qty + 1,
              }
            : item,
      );
    });
  };

  const increaseQty = (
    id: number,
  ) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (
          item.qty >= item.stock
        ) {
          alert(
            "Jumlah melebihi stok.",
          );

          return item;
        }

        return {
          ...item,
          qty: item.qty + 1,
        };
      }),
    );
  };

  const decreaseQty = (
    id: number,
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty:
                  item.qty - 1,
              }
            : item,
        )
        .filter(
          (item) =>
            item.qty > 0,
        ),
    );
  };

  const removeItem = (
    id: number,
  ) => {
    setCart((current) =>
      current.filter(
        (item) =>
          item.id !== id,
      ),
    );
  };

  /*
   * ==========================================================
   * PROCESS TRANSACTION
   * ==========================================================
   */

  const processTransaction =
    async () => {
      if (cart.length === 0) {
        alert(
          "Keranjang masih kosong.",
        );
        return;
      }

      if (payment === "") {
        alert(
          "Masukkan nominal pembayaran.",
        );
        return;
      }

      if (paidAmount < total) {
        alert(
          "Nominal pembayaran kurang.",
        );
        return;
      }

      try {
        setProcessing(true);
        setError("");

        const now = new Date();

        const invoice = `INV-${now.getFullYear()}${String(
          now.getMonth() + 1,
        ).padStart(
          2,
          "0",
        )}${String(
          now.getDate(),
        ).padStart(
          2,
          "0",
        )}-${String(
          now.getHours(),
        ).padStart(
          2,
          "0",
        )}${String(
          now.getMinutes(),
        ).padStart(
          2,
          "0",
        )}${String(
          now.getSeconds(),
        ).padStart(
          2,
          "0",
        )}`;

        const response =
          await fetch(
            "/api/sales",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                invoice_number:
                  invoice,

                customer_id:
                  selectedCustomer
                    ? Number(
                        selectedCustomer,
                      )
                    : null,

                total_amount:
                  total,

                paid_amount:
                  paidAmount,

                change_amount:
                  change,

                payment_method:
                  paymentMethod,

                items: cart.map(
                  (item) => ({
                    product_id:
                      item.id,

                    quantity:
                      item.qty,

                    price:
                      item.price,
                  }),
                ),
              }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Transaksi gagal",
          );
        }

        const customer =
          customers.find(
            (item) =>
              item.id ===
              Number(
                selectedCustomer,
              ),
          );

        const transaction: LastTransaction =
          {
            invoice,

            total,

            paid:
              paidAmount,

            change,

            paymentMethod,

            customer:
              customer?.name ||
              "Umum",

            cashier:
              "Admin",

            date:
              now.toLocaleDateString(
                "id-ID",
              ),

            time:
              now.toLocaleTimeString(
                "id-ID",
              ),

            items: cart.map(
              (item) => ({
                code:
                  item.code,

                name:
                  item.name,

                qty:
                  item.qty,

                price:
                  item.price,

                subtotal:
                  item.price *
                  item.qty,
              }),
            ),
          };

        setLastTransaction(
          transaction,
        );

        setCart([]);
        setSearch("");
        setSelectedCustomer("");
        setPayment("");
        setPaymentMethod("cash");

        await loadData();

        /*
         * Tidak membuka dialog print
         * secara otomatis.
         *
         * User menekan tombol
         * "Cetak Struk" setelah
         * struk tampil.
         */
      } catch (err) {
        console.error(err);

        const message =
          err instanceof Error
            ? err.message
            : "Transaksi gagal";

        setError(message);

        alert(message);
      } finally {
        setProcessing(false);
      }
    };

  /*
   * ==========================================================
   * PRINT RECEIPT
   * ==========================================================
   */

  const printReceipt = async () => {
    if (!lastTransaction) {
      return;
    }

    try {
      setPrinting(true);
      setError("");

      /*
       * Ambil data toko terbaru.
       */
      const response = await fetch(
        "/api/store",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Gagal mengambil data toko",
        );
      }

      const store = data.data;

      const settings: StoreSettings = {
        storeName:
          typeof store?.name === "string"
            ? store.name.trim()
            : "",

        address:
          typeof store?.address === "string"
            ? store.address.trim()
            : "",

        phone:
          typeof store?.phone === "string"
            ? store.phone.trim()
            : "",

        logo:
          typeof store?.logo === "string"
            ? store.logo.trim()
            : "",
      };

      /*
       * Simpan data toko terbaru.
       */
      setStoreSettings(settings);

      /*
       * Beri waktu React untuk
       * merender data toko ke DOM.
       */
      await new Promise<void>(
        (resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        },
      );

      /*
       * Pastikan receipt ada.
       */
      const receiptElement =
        document.getElementById(
          "print-receipt",
        );

      if (!receiptElement) {
        throw new Error(
          "Struk tidak ditemukan.",
        );
      }

      /*
       * Pastikan data toko sudah
       * terlihat di receipt.
       */
      const storeNameElement =
        document.getElementById(
          "receipt-store-name",
        );

      if (
        settings.storeName &&
        storeNameElement &&
        storeNameElement.textContent?.trim() !==
          settings.storeName
      ) {
        /*
         * Tunggu satu render tambahan.
         */
        await new Promise<void>(
          (resolve) => {
            setTimeout(resolve, 100);
          },
        );
      }

      /*
       * Aktifkan mode print.
       */
      document.body.classList.add(
        "printing-receipt",
      );

      /*
       * Beri browser kesempatan
       * menerapkan CSS print.
       */
      await new Promise<void>(
        (resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        },
      );

      /*
       * Buka dialog print.
       */
      window.print();
    } catch (err) {
      console.error(err);

      setPrinting(false);

      const message =
        err instanceof Error
          ? err.message
          : "Gagal mencetak struk";

      setError(message);
      alert(message);
    }
  };

  /*
   * ==========================================================
   * HISTORICAL RECEIPT
   * ==========================================================
   */

  const printHistoricalReceipt =
    async (
      saleId: number,
    ) => {
      try {
        setPrintingId(saleId);
        setError("");

        const response =
          await fetch(
            `/api/sales/${saleId}`,
            {
              cache: "no-store",
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Gagal mengambil detail transaksi",
          );
        }

        const sale =
          data.data.sale;

        const items =
          data.data.items;

        const date =
          new Date(
            sale.sale_date,
          );

        setLastTransaction({
          invoice:
            sale.invoice_number,

          total: Number(
            sale.total_amount,
          ),

          paid: Number(
            sale.paid_amount,
          ),

          change: Number(
            sale.change_amount,
          ),

          paymentMethod:
            sale.payment_method,

          customer:
            sale.customer_name ||
            "Umum",

          cashier:
            "Admin",

          date:
            date.toLocaleDateString(
              "id-ID",
            ),

          time:
            date.toLocaleTimeString(
              "id-ID",
            ),

          items: items.map(
            (item: {
              code?: string;
              name?: string;
              quantity: number;
              price: number;
              subtotal: number;
            }) => ({
              code:
                item.code || "-",

              name:
                item.name ||
                "Produk",

              qty: Number(
                item.quantity,
              ),

              price: Number(
                item.price,
              ),

              subtotal:
                Number(
                  item.subtotal,
                ),
            }),
          ),
        });

        /*
         * Ambil data toko sebelum
         * tombol cetak digunakan.
         */
        await loadStoreSettings();
      } catch (err) {
        console.error(err);

        const message =
          err instanceof Error
            ? err.message
            : "Gagal mengambil transaksi";

        setError(message);

        alert(message);
      } finally {
        setPrintingId(null);
      }
    };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-500">
            Memuat data kasir...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            width: 80mm !important;
            min-width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body.printing-receipt {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          body.printing-receipt * {
            visibility: hidden !important;
          }

          body.printing-receipt
            #print-receipt,
          body.printing-receipt
            #print-receipt * {
            visibility: visible !important;
          }

          body.printing-receipt
            #print-receipt {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            min-width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            z-index: 2147483647 !important;
            box-sizing: border-box !important;
          }

          body.printing-receipt
            #print-receipt
            img {
            display: block !important;
            max-width: 55mm !important;
            width: auto !important;
            height: auto !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          body.printing-receipt
            #print-receipt
            * {
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* PRODUK + KERANJANG */}

        <div className="grid gap-5 lg:grid-cols-3 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pilih Produk
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Klik produk untuk
                  menambahkannya ke keranjang
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {filteredProducts.length}{" "}
                produk
              </span>
            </div>

            <div className="relative mb-5">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Cari nama atau kode produk..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.length ===
              0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Produk tidak
                    ditemukan.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Coba gunakan nama atau
                    kode produk lain.
                  </p>
                </div>
              ) : (
                filteredProducts.map(
                  (product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        addToCart(
                          product,
                        )
                      }
                      disabled={
                        product.stock <=
                        0
                      }
                      className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {product.code}
                        </span>

                        <span
                          className={`text-[11px] font-semibold ${
                            product.stock >
                            0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          Stok{" "}
                          {
                            product.stock
                          }
                        </span>
                      </div>

                      <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-slate-900 group-hover:text-blue-700">
                        {product.name}
                      </h3>

                      {product.category && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {
                            product.category
                          }
                        </p>
                      )}

                      <p className="mt-4 text-sm font-bold text-blue-600">
                        {formatRupiah(
                          Number(
                            product.price,
                          ),
                        )}
                      </p>
                    </button>
                  ),
                )
              )}
            </div>
          </div>

          {/* KERANJANG */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Keranjang
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {cart.length} jenis
                  produk
                </p>
              </div>

              {cart.length > 0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white">
                  {cart.reduce(
                    (sum, item) =>
                      sum + item.qty,
                    0,
                  )}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Keranjang masih
                  kosong.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Pilih produk untuk
                  memulai transaksi.
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.code}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {formatRupiah(
                            item.price,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id,
                          )
                        }
                        className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQty(
                              item.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-100"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-sm font-bold text-slate-800">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQty(
                              item.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        {formatRupiah(
                          item.price *
                            item.qty,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pelanggan
              </label>

              <select
                value={selectedCustomer}
                onChange={(e) =>
                  setSelectedCustomer(
                    e.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  Umum
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={
                        customer.id
                      }
                    >
                      {customer.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="mt-5 rounded-xl bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">
                  Total
                </span>

                <span className="text-xl font-bold text-white">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PEMBAYARAN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Pembayaran
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Selesaikan pembayaran
              transaksi
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Metode Pembayaran
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              >
                <option value="cash">
                  Cash
                </option>

                <option value="qris">
                  QRIS
                </option>

                <option value="transfer">
                  Transfer
                </option>

                <option value="debit">
                  Debit
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nominal Bayar
              </label>

              <input
                type="number"
                min="0"
                value={payment}
                onChange={(e) =>
                  setPayment(
                    e.target.value,
                  )
                }
                placeholder="Masukkan nominal pembayaran"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Kembalian
              </label>

              <div
                className={`flex h-11 items-center rounded-xl border px-4 text-sm font-bold ${
                  change >= 0
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}
              >
                {formatRupiah(
                  change >= 0
                    ? change
                    : 0,
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              processTransaction
            }
            disabled={
              processing ||
              cart.length === 0
            }
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing
              ? "Memproses Transaksi..."
              : "Simpan Transaksi"}
          </button>
        </div>

        {/* RIWAYAT */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Penjualan
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Daftar transaksi penjualan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Invoice
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Pelanggan
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Tanggal
                  </th>

                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Bayar
                  </th>

                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Kembalian
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Metode
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      Belum ada
                      transaksi.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {
                          sale.invoice_number
                        }
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {
                          sale.customer_name ||
                          "Umum"
                        }
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {new Date(
                          sale.sale_date,
                        ).toLocaleString(
                          "id-ID",
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-slate-800">
                        {formatRupiah(
                          Number(
                            sale.total_amount,
                          ),
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-slate-600">
                        {formatRupiah(
                          Number(
                            sale.paid_amount,
                          ),
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-slate-600">
                        {formatRupiah(
                          Number(
                            sale.change_amount,
                          ),
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
                          {
                            sale.payment_method
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {sale.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            printHistoricalReceipt(
                              sale.id,
                            )
                          }
                          disabled={
                            printingId ===
                            sale.id
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {printingId ===
                          sale.id
                            ? "Menyiapkan..."
                            : "Cetak"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ====================================================
            RECEIPT
           ==================================================== */}

        {lastTransaction && (
          <div className="print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Struk Siap Dicetak
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Invoice{" "}
                    {
                      lastTransaction.invoice
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    printReceipt
                  }
                  disabled={printing}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {printing
                    ? "Menyiapkan..."
                    : "Cetak Struk"}
                </button>
              </div>

              <div className="mx-auto max-w-[80mm] rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-center">
                  {storeSettings.logo && (
                    <img
                      src={
                        storeSettings.logo
                      }
                      alt="Logo toko"
                      className="mx-auto mb-2 h-16 max-w-[55mm] object-contain"
                    />
                  )}

                  {storeSettings.storeName && (
                    <h3 className="text-base font-bold text-slate-900">
                      {
                        storeSettings.storeName
                      }
                    </h3>
                  )}

                  {storeSettings.address && (
                    <p className="text-xs text-slate-600">
                      {
                        storeSettings.address
                      }
                    </p>
                  )}

                  {storeSettings.phone && (
                    <p className="text-xs text-slate-600">
                      Telp:{" "}
                      {
                        storeSettings.phone
                      }
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-500">
                    Struk Penjualan
                  </p>
                </div>

                <div className="my-2 border-t border-dashed border-slate-400" />

                <div className="text-xs text-slate-700">
                  <div className="flex justify-between gap-2">
                    <span>
                      Invoice
                    </span>

                    <span>
                      {
                        lastTransaction.invoice
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span>
                      Tanggal
                    </span>

                    <span>
                      {
                        lastTransaction.date
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span>
                      Waktu
                    </span>

                    <span>
                      {
                        lastTransaction.time
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span>
                      Pelanggan
                    </span>

                    <span className="text-right">
                      {
                        lastTransaction.customer
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span>
                      Kasir
                    </span>

                    <span>
                      {
                        lastTransaction.cashier
                      }
                    </span>
                  </div>
                </div>

                <div className="my-2 border-t border-dashed border-slate-400" />

                <div className="space-y-2 text-xs">
                  {lastTransaction.items.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={`${item.code}-${index}`}
                      >
                        <div className="font-medium text-slate-800">
                          {item.name}
                        </div>

                        <div className="flex justify-between gap-2 text-slate-600">
                          <span>
                            {
                              item.qty
                            }{" "}
                            x{" "}
                            {formatRupiah(
                              item.price,
                            )}
                          </span>

                          <span>
                            {formatRupiah(
                              item.subtotal,
                            )}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="my-2 border-t border-dashed border-slate-400" />

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      TOTAL
                    </span>

                    <span>
                      {formatRupiah(
                        lastTransaction.total,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>
                      Bayar
                    </span>

                    <span>
                      {formatRupiah(
                        lastTransaction.paid,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>
                      Kembalian
                    </span>

                    <span>
                      {formatRupiah(
                        lastTransaction.change,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>
                      Metode
                    </span>

                    <span className="uppercase">
                      {
                        lastTransaction.paymentMethod
                      }
                    </span>
                  </div>
                </div>

                <div className="my-3 border-t border-dashed border-slate-400" />

                <div className="text-center text-xs text-slate-600">
                  <p>
                    Terima kasih
                  </p>

                  <p>
                    Selamat berbelanja
                    kembali
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            PRINT RECEIPT
           ==================================================== */}

        {lastTransaction && (
          <div
            id="print-receipt"
            className="hidden w-[80mm] bg-white p-2 text-black"
          >
            <div className="text-center">
              {storeSettings.logo && (
                <div className="mb-2 flex justify-center">
                  <img
                    src={
                      storeSettings.logo
                    }
                    alt="Logo toko"
                    className="h-16 max-w-[55mm] object-contain"
                  />
                </div>
              )}

              {storeSettings.storeName && (
                <h1
                  id="receipt-store-name"
                  className="text-lg font-bold"
                >
                  {
                    storeSettings.storeName
                  }
                </h1>
              )}

              {storeSettings.address && (
                <p className="text-xs">
                  {
                    storeSettings.address
                  }
                </p>
              )}

              {storeSettings.phone && (
                <p className="text-xs">
                  Telp:{" "}
                  {
                    storeSettings.phone
                  }
                </p>
              )}

              <p className="mt-1 text-xs">
                Struk Penjualan
              </p>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <div className="text-xs">
              <div className="flex justify-between gap-2">
                <span>
                  Invoice
                </span>

                <span>
                  {
                    lastTransaction.invoice
                  }
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span>
                  Tanggal
                </span>

                <span>
                  {
                    lastTransaction.date
                  }
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span>
                  Waktu
                </span>

                <span>
                  {
                    lastTransaction.time
                  }
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span>
                  Pelanggan
                </span>

                <span className="text-right">
                  {
                    lastTransaction.customer
                  }
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span>
                  Kasir
                </span>

                <span>
                  {
                    lastTransaction.cashier
                  }
                </span>
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <div className="space-y-2 text-xs">
              {lastTransaction.items.map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={`${item.code}-${index}`}
                  >
                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="flex justify-between gap-2">
                      <span>
                        {
                          item.qty
                        }{" "}
                        x{" "}
                        {formatRupiah(
                          item.price,
                        )}
                      </span>

                      <span>
                        {formatRupiah(
                          item.subtotal,
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span>
                  TOTAL
                </span>

                <span>
                  {formatRupiah(
                    lastTransaction.total,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Bayar
                </span>

                <span>
                  {formatRupiah(
                    lastTransaction.paid,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Kembalian
                </span>

                <span>
                  {formatRupiah(
                    lastTransaction.change,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Metode
                </span>

                <span className="uppercase">
                  {
                    lastTransaction.paymentMethod
                  }
                </span>
              </div>
            </div>

            <div className="my-3 border-t border-dashed border-black" />

            <div className="text-center text-xs">
              <p>
                Terima kasih
              </p>

              <p>
                Selamat berbelanja
                kembali
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}