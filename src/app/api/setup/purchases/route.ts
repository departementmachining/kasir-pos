import sql from "@/lib/db";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        supplier_id INTEGER,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'completed',
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_purchase_supplier
          FOREIGN KEY (supplier_id)
          REFERENCES suppliers(id)
          ON DELETE SET NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id SERIAL PRIMARY KEY,
        purchase_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        subtotal INTEGER NOT NULL DEFAULT 0,

        CONSTRAINT fk_purchase_item_purchase
          FOREIGN KEY (purchase_id)
          REFERENCES purchases(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_purchase_item_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
      )
    `;

    return Response.json({
      success: true,
      message: "Tabel purchases dan purchase_items berhasil dibuat",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat tabel pembelian",
      },
      { status: 500 }
    );
  }
}