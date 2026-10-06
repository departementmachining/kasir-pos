"use client";

import { useEffect, useMemo, useState } from "react";

type Supplier = {
  id: number;
  code: string;
  name: string;
};

type Product = {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
};

type PurchaseItem = {
  product_id: number;
  code: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Purchase = {
  id: number;
  invoice_number: string;
  supplier_id: number | null;
  supplier_name: string | null;
  purchase_date: string;
  total_amount: number;
  status: string;
  note: string | null;
};

export default function PurchasesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");

  const [items, setItems] = useState<PurchaseItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [supplierResponse, productResponse, purchaseResponse] =
        await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/products"),
          fetch("/api/purchases"),
        ]);

      if (
        !supplierResponse.ok ||
        !productResponse.ok ||
        !purchaseResponse.ok
      ) {
        throw new Error("Gagal mengambil data");
      }

      const supplierResult = await supplierResponse.json();
      const productResult = await productResponse.json();
      const purchaseResult = await purchaseResponse.json();

      if (!supplierResult.success) {
        throw new Error("Gagal mengambil supplier");
      }

      if (!productResult.success) {
        throw new Error("Gagal mengambil produk");
      }

      if (!purchaseResult.success) {
        throw new Error("Gagal mengambil pembelian");
      }

      setSuppliers(supplierResult.data);
      setProducts(productResult.data);
      setPurchases(purchaseResult.data);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data pembelian");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === Number(selectedProductId)
  );

  function handleProductChange(value: string) {
    setSelectedProductId(value);

    const product = products.find(
      (item) => item.id === Number(value)
    );

    if (product) {
      setPrice(Number(product.price));
    } else {
      setPrice(0);
    }
  }

  function addItem() {
    setError("");

    if (!selectedProduct) {
      setError("Pilih produk terlebih dahulu");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity harus lebih dari 0");
      return;
    }

    if (
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      setError("Harga beli tidak valid");
      return;
    }

    const existingItem = items.find(
      (item) => item.product_id === selectedProduct.id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      setItems(
        items.map((item) =>
          item.product_id === selectedProduct.id
            ? {
                ...item,
                quantity: newQuantity,
                price: Number(price),
                subtotal: newQuantity * Number(price),
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product_id: selectedProduct.id,
          code: selectedProduct.code,
          name: selectedProduct.name,
          quantity,
          price: Number(price),
          subtotal: quantity * Number(price),
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
    setPrice(0);
  }

  function removeItem(productId: number) {
    setItems(
      items.filter((item) => item.product_id !== productId)
    );
  }

  function updateQuantity(productId: number, value: number) {
    if (!Number.isInteger(value) || value < 1) {
      return;
    }

    setItems(
      items.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: value,
              subtotal: value * item.price,
            }
          : item
      )
    );
  }

  function updatePrice(productId: number, value: number) {
    if (!Number.isFinite(value) || value < 0) {
      return;
    }

    setItems(
      items.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              price: value,
              subtotal: item.quantity * value,
            }
          : item
      )
    );
  }

  const totalAmount = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  }, [items]);

  function generateInvoiceNumber() {
    const now = new Date();

    const date = now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const time = now
      .toTimeString()
      .slice(0, 8)
      .replace(/:/g, "");

    return `PO-${date}-${time}`;
  }

  async function savePurchase() {
    try {
      setError("");
      setSuccess("");

      if (!invoiceNumber.trim()) {
        setError("Nomor invoice wajib diisi");
        return;
      }

      if (items.length === 0) {
        setError("Tambahkan minimal satu produk");
        return;
      }

      setSaving(true);

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          supplier_id: supplierId
            ? Number(supplierId)
            : null,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
          note,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menyimpan pembelian"
        );
      }

      setSuccess("Pembelian berhasil disimpan");

      setInvoiceNumber("");
      setSupplierId("");
      setNote("");
      setItems([]);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pembelian"
      );
    } finally {
      setSaving(false);
    }
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="space-y-5">
      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 shadow-sm">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12 2.3 2.3 4.7-5" />
          </svg>

          <span>{success}</span>
        </div>
      )}

      {/* FORM PEMBELIAN */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 5h16M4 9h16M6 13h12M8 17h8" />
                <path d="M4 3v18M20 3v18" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Input Pembelian
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Tambahkan detail pembelian dan produk yang masuk ke stok.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* INFORMASI PEMBELIAN */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nomor Invoice
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) =>
                    setInvoiceNumber(e.target.value)
                  }
                  placeholder="PO-001"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setInvoiceNumber(generateInvoiceNumber())
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supplier
              </label>

              <select
                value={supplierId}
                onChange={(e) =>
                  setSupplierId(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Pilih Supplier</option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.code} - {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Catatan
              </label>

              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan pembelian"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {/* TAMBAH PRODUK */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tambah Produk
                </h3>

                <p className="text-xs text-slate-500">
                  Pilih produk, quantity, dan harga beli.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Produk
                </label>

                <select
                  value={selectedProductId}
                  onChange={(e) =>
                    handleProductChange(e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Pilih Produk</option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Harga Beli
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              Tambah Produk
            </button>
          </div>

          {/* DAFTAR ITEM */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 bg-white px-4 py-3.5 sm:px-5">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Produk Pembelian
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Periksa quantity dan harga sebelum menyimpan.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                      Produk
                    </th>

                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Harga
                    </th>

                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Subtotal
                    </th>

                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center sm:px-5"
                      >
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M6 7h12l-1 13H7L6 7Z" />
                            <path d="M9 7a3 3 0 0 1 6 0" />
                          </svg>
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          Belum ada produk
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Tambahkan produk menggunakan form di atas.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.product_id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="font-semibold text-slate-900">
                            {item.name}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {item.code}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.product_id,
                                Number(e.target.value)
                              )
                            }
                            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(
                                item.product_id,
                                Number(e.target.value)
                              )
                            }
                            className="h-10 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.product_id)
                            }
                            title="Hapus produk"
                            aria-label="Hapus produk"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL */}
          <div className="mt-6 flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Pembelian
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {formatRupiah(totalAmount)}
              </p>
            </div>

            <button
              type="button"
              onClick={savePurchase}
              disabled={saving || items.length === 0}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12.5 9.5 17 19 7.5" />
              </svg>

              {saving
                ? "Menyimpan..."
                : "Simpan Pembelian"}
            </button>
          </div>
        </div>
      </section>

      {/* RIWAYAT PEMBELIAN */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16M4 10h16M4 14h10M4 18h7" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Riwayat Pembelian
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Daftar transaksi pembelian yang tersimpan.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                  Invoice
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Supplier
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tanggal
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6"
                  >
                    <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                    Memuat data...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center sm:px-6"
                  >
                    <p className="text-sm font-medium text-slate-600">
                      Belum ada pembelian
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Riwayat transaksi akan tampil di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-900 sm:px-6">
                      {purchase.invoice_number}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {purchase.supplier_name || "-"}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {new Date(
                        purchase.purchase_date
                      ).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatRupiah(
                        Number(purchase.total_amount)
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}