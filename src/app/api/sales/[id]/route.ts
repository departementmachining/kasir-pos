import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const saleId = Number(id);

    if (!Number.isFinite(saleId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID penjualan tidak valid",
        },
        { status: 400 }
      );
    }

    const sales = await sql`
      SELECT
        s.id,
        s.invoice_number,
        s.sale_date,
        s.total_amount,
        s.paid_amount,
        s.change_amount,
        s.payment_method,
        s.status,
        COALESCE(c.name, 'Umum') AS customer_name
      FROM sales s
      LEFT JOIN customers c
        ON c.id = s.customer_id
      WHERE s.id = ${saleId}
      LIMIT 1
    `;

    if (sales.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const items = await sql`
      SELECT
        si.id,
        si.product_id,
        si.quantity,
        si.price,
        p.code,
        p.name,
        (si.quantity * si.price) AS subtotal
      FROM sale_items si
      LEFT JOIN products p
        ON p.id = si.product_id
      WHERE si.sale_id = ${saleId}
      ORDER BY si.id ASC
    `;

    return NextResponse.json({
      success: true,
      data: {
        sale: sales[0],
        items,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail transaksi",
      },
      { status: 500 }
    );
  }
}