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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalesPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [payment, setPayment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastTransaction, setLastTransaction] =
    useState<LastTransaction | null>(null);

  const [printingId, setPrintingId] =
    useState<number | null>(null);

  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>({
      storeName: "Kasir POS",
      address: "",
      phone: "",
      logo: "",
    });

  /*
   * LOAD DATA
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        customersResponse,
        salesResponse,
      ] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/customers"),
        fetch("/api/sales"),
      ]);

      const productsData =
        await productsResponse.json();

      const customersData =
        await customersResponse.json();

      const salesData =
        await salesResponse.json();

      if (
        !productsResponse.ok ||
        !productsData.success
      ) {
        throw new Error(
          productsData.message ||
            "Gagal mengambil data produk"
        );
      }

      if (
        !customersResponse.ok ||
        !customersData.success
      ) {
        throw new Error(
          customersData.message ||
            "Gagal mengambil data pelanggan"
        );
      }

      if (
        !salesResponse.ok ||
        !salesData.success
      ) {
        throw new Error(
          salesData.message ||
            "Gagal mengambil data penjualan"
        );
      }

      setProducts(
        productsData.data || []
      );

      setCustomers(
        customersData.data || []
      );

      setSales(
        salesData.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOAD DATA SAAT HALAMAN DIBUKA
   */
  useEffect(() => {
    loadData();
  }, []);

  /*
   * LOAD PENGATURAN TOKO
   */
  useEffect(() => {
    const savedSettings =
      localStorage.getItem(
        "storeSettings"
      );

    if (!savedSettings) {
      return;
    }

    try {
      const settings =
        JSON.parse(
          savedSettings
        );

      setStoreSettings({
        storeName:
          settings.storeName ||
          "Kasir POS",

        address:
          settings.address ||
          "",

        phone:
          settings.phone ||
          "",

        logo:
          settings.logo ||
          "",
      });
    } catch (err) {
      console.error(
        "Gagal membaca pengaturan toko:",
        err
      );
    }
  }, []);

  /*
   * FILTER PRODUK
   */
  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
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
            .includes(keyword)
      );
    }, [products, search]);

  /*
   * TOTAL BELANJA
   */
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.qty,
      0
    );
  }, [cart]);

  /*
   * NOMINAL BAYAR
   */
  const paidAmount =
    Number(payment) || 0;

  /*
   * KEMBALIAN
   */
  const change =
    paidAmount - total;

  /*
   * TAMBAH PRODUK KE KERANJANG
   */
  const addToCart = (
    product: Product
  ) => {
    if (product.stock <= 0) {
      alert(
        "Stok produk habis."
      );

      return;
    }

    setCart(
      (currentCart) => {
        const existing =
          currentCart.find(
            (item) =>
              item.id ===
              product.id
          );

        if (existing) {
          if (
            existing.qty >=
            product.stock
          ) {
            alert(
              "Jumlah melebihi stok."
            );

            return currentCart;
          }

          return currentCart.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    qty:
                      item.qty +
                      1,
                  }
                : item
          );
        }

        return [
          ...currentCart,
          {
            ...product,
            qty: 1,
          },
        ];
      }
    );
  };

  /*
   * TAMBAH JUMLAH
   */
  const increaseQty = (
    id: number
  ) => {
    setCart(
      (currentCart) =>
        currentCart.map(
          (item) => {
            if (
              item.id !==
              id
            ) {
              return item;
            }

            if (
              item.qty >=
              item.stock
            ) {
              alert(
                "Jumlah melebihi stok."
              );

              return item;
            }

            return {
              ...item,
              qty:
                item.qty +
                1,
            };
          }
        )
    );
  };

  /*
   * KURANGI JUMLAH
   */
  const decreaseQty = (
    id: number
  ) => {
    setCart(
      (currentCart) =>
        currentCart
          .map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    qty:
                      item.qty -
                      1,
                  }
                : item
          )
          .filter(
            (item) =>
              item.qty > 0
          )
    );
  };

  /*
   * HAPUS PRODUK
   */
  const removeItem = (
    id: number
  ) => {
    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  /*
   * PROSES TRANSAKSI
   */
  const processTransaction =
    async () => {
      if (
        cart.length === 0
      ) {
        alert(
          "Keranjang masih kosong."
        );

        return;
      }

      if (
        payment === "" ||
        !Number.isFinite(
          Number(payment)
        )
      ) {
        alert(
          "Masukkan nominal pembayaran."
        );

        return;
      }

      if (
        paidAmount <
        total
      ) {
        alert(
          "Nominal pembayaran kurang."
        );

        return;
      }

      try {
        setProcessing(true);
        setError("");

        const now =
          new Date();

        const invoice =
          `INV-${now
            .getFullYear()}${String(
            now.getMonth() + 1
          ).padStart(
            2,
            "0"
          )}${String(
            now.getDate()
          ).padStart(
            2,
            "0"
          )}-${String(
            now.getHours()
          ).padStart(
            2,
            "0"
          )}${String(
            now.getMinutes()
          ).padStart(
            2,
            "0"
          )}${String(
            now.getSeconds()
          ).padStart(
            2,
            "0"
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
                        selectedCustomer
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

                items:
                  cart.map(
                    (item) => ({
                      product_id:
                        item.id,

                      quantity:
                        item.qty,

                      price:
                        item.price,
                    })
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Transaksi gagal"
          );
        }

        const selectedCustomerData =
          customers.find(
            (customer) =>
              customer.id ===
              Number(
                selectedCustomer
              )
          );

        const transactionDate =
          new Date();

        const transaction: LastTransaction =
          {
            invoice,

            total,

            paid:
              paidAmount,

            change,

            paymentMethod,

            customer:
              selectedCustomerData?.name ||
              "Umum",

            cashier: "Admin",

            date:
              transactionDate.toLocaleDateString(
                "id-ID"
              ),

            time:
              transactionDate.toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute:
                    "2-digit",
                  second:
                    "2-digit",
                }
              ),

            items:
              cart.map(
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
                })
              ),
          };

        setLastTransaction(
          transaction
        );

        setCart([]);

        setSearch("");

        setSelectedCustomer("");

        setPayment("");

        setPaymentMethod(
          "cash"
        );

        alert(
          "Transaksi berhasil disimpan."
        );

        await loadData();
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
   * CETAK STRUK TRANSAKSI TERAKHIR
   */
  const printReceipt = () => {
    if (!lastTransaction) {
      return;
    }

    window.print();
  };

  /*
   * CETAK ULANG STRUK DARI RIWAYAT
   */
  const printHistoricalReceipt =
    async (
      saleId: number
    ) => {
      try {
        setPrintingId(
          saleId
        );

        setError("");

        const response =
          await fetch(
            `/api/sales/${saleId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Gagal mengambil detail transaksi"
          );
        }

        const sale =
          data.data.sale;

        const items =
          data.data.items;

        const transactionDate =
          new Date(
            sale.sale_date
          );

        const historicalTransaction: LastTransaction =
          {
            invoice:
              sale.invoice_number,

            total: Number(
              sale.total_amount
            ),

            paid: Number(
              sale.paid_amount
            ),

            change: Number(
              sale.change_amount
            ),

            paymentMethod:
              sale.payment_method,

            customer:
              sale.customer_name ||
              "Umum",

            cashier:
              "Admin",

            date:
              transactionDate.toLocaleDateString(
                "id-ID"
              ),

            time:
              transactionDate.toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute:
                    "2-digit",
                  second:
                    "2-digit",
                }
              ),

            items:
              items.map(
                (
                  item: {
                    code?: string;
                    name?: string;
                    quantity: number;
                    price: number;
                    subtotal: number;
                  }
                ) => ({
                  code:
                    item.code ||
                    "-",

                  name:
                    item.name ||
                    "Produk",

                  qty: Number(
                    item.quantity
                  ),

                  price: Number(
                    item.price
                  ),

                  subtotal:
                    Number(
                      item.subtotal
                    ),
                })
              ),
          };

        setLastTransaction(
          historicalTransaction
        );

        setTimeout(() => {
          window.print();
        }, 300);
      } catch (err) {
        console.error(err);

        const message =
          err instanceof Error
            ? err.message
            : "Gagal mencetak transaksi";

        setError(message);

        alert(message);
      } finally {
        setTimeout(() => {
          setPrintingId(
            null
          );
        }, 500);
      }
    };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Memuat data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="print:hidden">
        <h1 className="text-2xl font-bold">
          Kasir / Penjualan
        </h1>

        <p className="text-gray-500">
          Proses transaksi penjualan
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* KASIR */}
      {/* ========================= */}

      <div className="grid gap-6 lg:grid-cols-3 print:hidden">

        {/* ========================= */}
        {/* PRODUK */}
        {/* ========================= */}

        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">

          <div className="mb-5">

            <h2 className="mb-3 text-lg font-semibold">
              Pilih Produk
            </h2>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Cari nama atau kode produk..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {filteredProducts.length ===
            0 ? (
              <div className="col-span-full rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                Produk tidak ditemukan.
              </div>
            ) : (
              filteredProducts.map(
                (product) => (
                  <button
                    key={
                      product.id
                    }
                    type="button"
                    onClick={() =>
                      addToCart(
                        product
                      )
                    }
                    disabled={
                      product.stock <=
                      0
                    }
                    className="rounded-xl border p-4 text-left transition hover:border-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">

                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {
                          product.code
                        }
                      </span>

                      <span className="text-xs text-gray-500">
                        Stok:{" "}
                        {
                          product.stock
                        }
                      </span>

                    </div>

                    <h3 className="font-semibold">
                      {
                        product.name
                      }
                    </h3>

                    {product.category && (
                      <p className="mt-1 text-xs text-gray-500">
                        {
                          product.category
                        }
                      </p>
                    )}

                    <p className="mt-3 font-bold text-blue-600">
                      {formatRupiah(
                        Number(
                          product.price
                        )
                      )}
                    </p>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* ========================= */}
        {/* KERANJANG */}
        {/* ========================= */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-semibold">
            Keranjang
          </h2>

          {cart.length ===
          0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              Keranjang masih kosong.
            </div>
          ) : (
            <div className="space-y-4">

              {cart.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="border-b pb-4"
                  >

                    <div className="flex justify-between gap-3">

                      <div className="min-w-0">

                        <p className="font-medium">
                          {
                            item.name
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            item.code
                          }
                        </p>

                        <p className="mt-1 text-sm">
                          {formatRupiah(
                            item.price
                          )}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQty(
                              item.id
                            )
                          }
                          className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                        >
                          −
                        </button>

                        <span className="w-8 text-center font-semibold">
                          {
                            item.qty
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQty(
                              item.id
                            )
                          }
                          className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                        >
                          +
                        </button>

                      </div>

                      <span className="font-semibold">
                        {formatRupiah(
                          item.price *
                            item.qty
                        )}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {/* CUSTOMER */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium">
              Pelanggan
            </label>

            <select
              value={
                selectedCustomer
              }
              onChange={(e) =>
                setSelectedCustomer(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Umum
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={
                      customer.id
                    }
                    value={
                      customer.id
                    }
                  >
                    {
                      customer.name
                    }
                  </option>
                )
              )}
            </select>

          </div>

          {/* TOTAL */}

          <div className="mt-5 border-t pt-5">

            <div className="flex items-center justify-between text-lg font-bold">
              <span>
                Total
              </span>

              <span className="text-blue-600">
                {formatRupiah(
                  total
                )}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* PEMBAYARAN */}
      {/* ========================= */}

      <div className="rounded-xl border bg-white p-5 shadow-sm print:hidden">

        <h2 className="mb-5 text-lg font-semibold">
          Pembayaran
        </h2>

        <div className="grid gap-5 md:grid-cols-3">

          {/* METODE */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Metode Pembayaran
            </label>

            <select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
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

          {/* BAYAR */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Nominal Bayar
            </label>

            <input
              type="number"
              min="0"
              value={
                payment
              }
              onChange={(e) =>
                setPayment(
                  e.target.value
                )
              }
              placeholder="Masukkan nominal pembayaran"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* KEMBALIAN */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Kembalian
            </label>

            <div
              className={`rounded-lg border px-4 py-3 font-bold ${
                change >= 0
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {formatRupiah(
                change >= 0
                  ? change
                  : 0
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
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing
            ? "Memproses Transaksi..."
            : "Simpan Transaksi"}
        </button>

      </div>

      {/* ========================= */}
      {/* STRUK TERAKHIR */}
      {/* ========================= */}

      {lastTransaction && (
        <div className="print:hidden rounded-xl border bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold">
                Transaksi Terakhir
              </h2>

              <p className="text-sm text-gray-500">
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
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              🖨️ Cetak Struk
            </button>

          </div>

          <div className="grid gap-3 sm:grid-cols-4">

            <div>
              <p className="text-xs text-gray-500">
                Total
              </p>

              <p className="font-semibold">
                {formatRupiah(
                  lastTransaction.total
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Bayar
              </p>

              <p className="font-semibold">
                {formatRupiah(
                  lastTransaction.paid
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Kembalian
              </p>

              <p className="font-semibold">
                {formatRupiah(
                  lastTransaction.change
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Pembayaran
              </p>

              <p className="font-semibold uppercase">
                {
                  lastTransaction.paymentMethod
                }
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ========================= */}
      {/* RIWAYAT PENJUALAN */}
      {/* ========================= */}

      <div className="rounded-xl border bg-white shadow-sm print:hidden">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Riwayat Penjualan
          </h2>

          <p className="text-sm text-gray-500">
            Daftar transaksi penjualan
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Invoice
                </th>

                <th className="px-4 py-3 text-left">
                  Pelanggan
                </th>

                <th className="px-4 py-3 text-left">
                  Tanggal
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-right">
                  Bayar
                </th>

                <th className="px-4 py-3 text-right">
                  Kembalian
                </th>

                <th className="px-4 py-3 text-left">
                  Metode
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {sales.length ===
              0 ? (
                <tr>

                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Belum ada transaksi.
                  </td>

                </tr>
              ) : (
                sales.map(
                  (sale) => (
                    <tr
                      key={
                        sale.id
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="px-4 py-3 font-medium">
                        {
                          sale.invoice_number
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          sale.customer_name ||
                          "Umum"
                        }
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          sale.sale_date
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatRupiah(
                          Number(
                            sale.total_amount
                          )
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatRupiah(
                          Number(
                            sale.paid_amount
                          )
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatRupiah(
                          Number(
                            sale.change_amount
                          )
                        )}
                      </td>

                      <td className="px-4 py-3 uppercase">
                        {
                          sale.payment_method
                        }
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {
                            sale.status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            printHistoricalReceipt(
                              sale.id
                            )
                          }
                          disabled={
                            printingId ===
                            sale.id
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {printingId ===
                          sale.id
                            ? "Menyiapkan..."
                            : "🖨️ Cetak"}
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================================================= */}
      {/* STRUK 80MM - HANYA MUNCUL SAAT PRINT */}
      {/* ================================================= */}

      {lastTransaction && (
        <div className="hidden print:block print:w-[80mm] print:p-2">

          <div className="text-center">

            {/* LOGO TOKO */}

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

            {/* NAMA TOKO */}

            <h1 className="text-lg font-bold">
              {
                storeSettings.storeName
              }
            </h1>

            {/* ALAMAT */}

            {storeSettings.address && (
              <p className="text-xs">
                {
                  storeSettings.address
                }
              </p>
            )}

            {/* TELEPON */}

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

          <div className="my-2 border-t border-dashed" />

          {/* INFO TRANSAKSI */}

          <div className="text-xs">

            <div className="flex justify-between gap-2">
              <span>
                Invoice
              </span>

              <span className="text-right">
                {
                  lastTransaction.invoice
                }
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span>
                Tanggal
              </span>

              <span className="text-right">
                {
                  lastTransaction.date
                }
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span>
                Waktu
              </span>

              <span className="text-right">
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

              <span className="text-right">
                {
                  lastTransaction.cashier
                }
              </span>
            </div>

          </div>

          <div className="my-2 border-t border-dashed" />

          {/* ITEM */}

          <div className="space-y-2 text-xs">

            {lastTransaction.items.map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item.code}-${index}`}
                >

                  <div className="font-medium">
                    {
                      item.name
                    }
                  </div>

                  <div className="flex justify-between gap-2">

                    <span>
                      {item.qty} x{" "}
                      {formatRupiah(
                        item.price
                      )}
                    </span>

                    <span>
                      {formatRupiah(
                        item.subtotal
                      )}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>

          <div className="my-2 border-t border-dashed" />

          {/* TOTAL */}

          <div className="space-y-1 text-xs">

            <div className="flex justify-between font-bold">
              <span>
                TOTAL
              </span>

              <span>
                {formatRupiah(
                  lastTransaction.total
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Bayar
              </span>

              <span>
                {formatRupiah(
                  lastTransaction.paid
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Kembalian
              </span>

              <span>
                {formatRupiah(
                  lastTransaction.change
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

          <div className="my-3 border-t border-dashed" />

          {/* FOOTER */}

          <div className="text-center text-xs">

            <p>
              Terima kasih
            </p>

            <p>
              Selamat berbelanja kembali
            </p>

          </div>

        </div>
      )}

    </div>
  );
}