import sql from "@/lib/db";

// GET SEMUA PEMBELIAN
export async function GET() {
  try {
    const purchases = await sql`
      SELECT
        p.id,
        p.invoice_number,
        p.supplier_id,
        s.name AS supplier_name,
        p.purchase_date,
        p.total_amount,
        p.status,
        p.note,
        p.created_at
      FROM purchases p
      LEFT JOIN suppliers s
        ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `;

    return Response.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data pembelian",
      },
      { status: 500 }
    );
  }
}

// TAMBAH PEMBELIAN
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      invoice_number,
      supplier_id,
      purchase_date,
      items,
      note,
    } = body;

    if (!invoice_number) {
      return Response.json(
        {
          success: false,
          message: "Nomor invoice wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Minimal harus ada satu produk",
        },
        { status: 400 }
      );
    }

    const existingInvoice = await sql`
      SELECT id
      FROM purchases
      WHERE invoice_number = ${invoice_number}
      LIMIT 1
    `;

    if (existingInvoice.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Nomor invoice sudah digunakan",
        },
        { status: 400 }
      );
    }

    let totalAmount = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return Response.json(
          {
            success: false,
            message: "Quantity produk tidak valid",
          },
          { status: 400 }
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        return Response.json(
          {
            success: false,
            message: "Harga produk tidak valid",
          },
          { status: 400 }
        );
      }

      totalAmount += quantity * price;
    }

    // SIMPAN HEADER PEMBELIAN
    const purchaseResult = await sql`
      INSERT INTO purchases (
        invoice_number,
        supplier_id,
        purchase_date,
        total_amount,
        status,
        note
      )
      VALUES (
        ${invoice_number},
        ${supplier_id ? Number(supplier_id) : null},
        ${purchase_date ? new Date(purchase_date) : new Date()},
        ${totalAmount},
        'completed',
        ${note || null}
      )
      RETURNING *
    `;

    const purchase = purchaseResult[0];

    // SIMPAN DETAIL + TAMBAH STOK + CATAT INVENTORY
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const subtotal = quantity * price;

      const productResult = await sql`
        SELECT id
        FROM products
        WHERE id = ${productId}
        LIMIT 1
      `;

      if (productResult.length === 0) {
        throw new Error(`Produk dengan ID ${productId} tidak ditemukan`);
      }

      await sql`
        INSERT INTO purchase_items (
          purchase_id,
          product_id,
          quantity,
          price,
          subtotal
        )
        VALUES (
          ${purchase.id},
          ${productId},
          ${quantity},
          ${price},
          ${subtotal}
        )
      `;

      await sql`
        UPDATE products
        SET
          stock = stock + ${quantity},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${productId}
      `;

      await sql`
        INSERT INTO inventory_movements (
          product_id,
          type,
          quantity,
          reference_type,
          reference_id,
          note
        )
        VALUES (
          ${productId},
          'IN',
          ${quantity},
          'purchase',
          ${purchase.id},
          ${`Pembelian ${invoice_number}`}
        )
      `;
    }

    return Response.json({
      success: true,
      message: "Pembelian berhasil disimpan",
      data: purchase,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menyimpan pembelian",
      },
      { status: 500 }
    );
  }
}