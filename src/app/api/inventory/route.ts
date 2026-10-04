import sql from "@/lib/db";

export async function GET() {
  try {
    const inventory = await sql`
      SELECT
        p.id,
        p.code,
        p.name,
        p.category,
        p.stock,
        p.min_stock,
        p.unit,
        COALESCE(
          SUM(
            CASE
              WHEN im.type = 'IN' THEN im.quantity
              WHEN im.type = 'OUT' THEN -im.quantity
              ELSE 0
            END
          ),
          0
        ) AS movement_total
      FROM products p
      LEFT JOIN inventory_movements im
        ON p.id = im.product_id
      GROUP BY
        p.id,
        p.code,
        p.name,
        p.category,
        p.stock,
        p.min_stock,
        p.unit
      ORDER BY p.id DESC
    `;

    return Response.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data inventory",
      },
      { status: 500 }
    );
  }
}