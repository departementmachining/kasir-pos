import sql from "@/lib/db";

export async function GET() {
  try {
    const products = await sql`
      SELECT
        id,
        code,
        name,
        category,
        price,
        stock,
        min_stock,
        unit,
        created_at,
        updated_at
      FROM products
      ORDER BY id DESC
    `;

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      code,
      name,
      category,
      price,
      stock,
      min_stock,
      unit,
    } = body;

    if (!code || !name) {
      return Response.json(
        {
          success: false,
          message: "Kode dan nama produk wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (
        code,
        name,
        category,
        price,
        stock,
        min_stock,
        unit
      )
      VALUES (
        ${code},
        ${name},
        ${category || null},
        ${Number(price) || 0},
        ${Number(stock) || 0},
        ${Number(min_stock) || 0},
        ${unit || "pcs"}
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan produk",
      },
      { status: 500 }
    );
  }
}