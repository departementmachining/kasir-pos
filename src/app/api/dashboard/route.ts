import sql from "@/lib/db";

export async function GET() {
  try {
    // PENJUALAN HARI INI
    const todaySales = await sql`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COUNT(*) AS total_transactions
      FROM sales
      WHERE sale_date >= CURRENT_DATE
        AND sale_date < CURRENT_DATE + INTERVAL '1 day'
        AND status = 'completed'
    `;

    // TOTAL PRODUK
    const totalProducts = await sql`
      SELECT COUNT(*) AS total
      FROM products
    `;

    // TOTAL PELANGGAN
    const totalCustomers = await sql`
      SELECT COUNT(*) AS total
      FROM customers
    `;

    // PENJUALAN 7 HARI TERAKHIR
    const salesChart = await sql`
      SELECT
        DATE(sale_date) AS tanggal,
        COALESCE(SUM(total_amount), 0) AS total
      FROM sales
      WHERE sale_date >= CURRENT_DATE - INTERVAL '6 days'
        AND sale_date < CURRENT_DATE + INTERVAL '1 day'
        AND status = 'completed'
      GROUP BY DATE(sale_date)
      ORDER BY tanggal ASC
    `;

    // PRODUK TERLARIS
    const topProducts = await sql`
      SELECT
        p.id,
        p.code,
        p.name,
        COALESCE(SUM(si.quantity), 0) AS total_qty,
        COALESCE(SUM(si.subtotal), 0) AS total_sales
      FROM sale_items si
      INNER JOIN products p
        ON p.id = si.product_id
      INNER JOIN sales s
        ON s.id = si.sale_id
      WHERE s.status = 'completed'
      GROUP BY
        p.id,
        p.code,
        p.name
      ORDER BY total_qty DESC
      LIMIT 5
    `;

    // TRANSAKSI TERBARU
    const recentSales = await sql`
      SELECT
        s.id,
        s.invoice_number,
        s.sale_date,
        c.name AS customer_name,
        s.total_amount,
        s.status
      FROM sales s
      LEFT JOIN customers c
        ON c.id = s.customer_id
      ORDER BY s.id DESC
      LIMIT 10
    `;

    return Response.json({
      success: true,

      data: {
        today: {
          total_sales:
            Number(todaySales[0]?.total_sales) || 0,

          total_transactions:
            Number(
              todaySales[0]?.total_transactions
            ) || 0,
        },

        total_products:
          Number(totalProducts[0]?.total) || 0,

        total_customers:
          Number(totalCustomers[0]?.total) || 0,

        sales_chart: salesChart.map((item) => ({
          tanggal: item.tanggal,
          total: Number(item.total) || 0,
        })),

        top_products: topProducts.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          total_qty: Number(item.total_qty) || 0,
          total_sales:
            Number(item.total_sales) || 0,
        })),

        recent_sales: recentSales.map((item) => ({
          id: item.id,
          invoice_number: item.invoice_number,
          sale_date: item.sale_date,
          customer_name:
            item.customer_name || "Umum",
          total_amount:
            Number(item.total_amount) || 0,
          status: item.status,
        })),
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data dashboard",
      },
      {
        status: 500,
      }
    );
  }
}