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
      setPrice(product ? Number(product.price) : "");
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

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
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
                price,
                subtotal: newQuantity * price,
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pembelian
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Input pembelian barang dan penambahan stok
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* FORM PEMBELIAN */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Input Pembelian
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setInvoiceNumber(generateInvoiceNumber())
                }
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
              >
                Auto
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Supplier
            </label>

            <select
              value={supplierId}
              onChange={(e) =>
                setSupplierId(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
            <label className="mb-2 block text-sm font-medium">
              Catatan
            </label>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan pembelian"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* TAMBAH PRODUK */}
        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-4 font-semibold">
            Tambah Produk
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Produk
              </label>

              <select
                value={selectedProductId}
                onChange={(e) =>
                  handleProductChange(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
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
              <label className="mb-2 block text-sm font-medium">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Tambah Produk
          </button>
        </div>

        {/* ITEM PEMBELIAN */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-sm">
                  Produk
                </th>

                <th className="px-3 py-3 text-sm">
                  Qty
                </th>

                <th className="px-3 py-3 text-sm">
                  Harga
                </th>

                <th className="px-3 py-3 text-sm">
                  Subtotal
                </th>

                <th className="px-3 py-3 text-sm">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.product_id}
                    className="border-b"
                  >
                    <td className="px-3 py-3">
                      <div className="font-medium">
                        {item.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.code}
                      </div>
                    </td>

                    <td className="px-3 py-3">
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
                        className="w-24 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-3">
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
                        className="w-32 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-3 font-medium">
                      {formatRupiah(item.subtotal)}
                    </td>

                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.product_id)
                        }
                        className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="mt-6 flex flex-col items-end">
          <div className="text-sm text-gray-500">
            Total Pembelian
          </div>

          <div className="text-3xl font-bold text-blue-600">
            {formatRupiah(totalAmount)}
          </div>

          <button
            type="button"
            onClick={savePurchase}
            disabled={saving || items.length === 0}
            className="mt-4 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? "Menyimpan..." : "Simpan Pembelian"}
          </button>
        </div>
      </div>

      {/* RIWAYAT PEMBELIAN */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Riwayat Pembelian
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm">
                  Invoice
                </th>

                <th className="px-4 py-3 text-sm">
                  Supplier
                </th>

                <th className="px-4 py-3 text-sm">
                  Tanggal
                </th>

                <th className="px-4 py-3 text-sm">
                  Total
                </th>

                <th className="px-4 py-3 text-sm">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Belum ada pembelian
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {purchase.invoice_number}
                    </td>

                    <td className="px-4 py-3">
                      {purchase.supplier_name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        purchase.purchase_date
                      ).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {formatRupiah(
                        Number(purchase.total_amount)
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}