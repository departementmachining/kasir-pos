import sql from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ===============================
// UPDATE PRODUK
// ===============================
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return Response.json(
        {
          success: false,
          message: "ID produk tidak valid",
        },
        { status: 400 }
      );
    }

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
      UPDATE products
      SET
        code = ${code},
        name = ${name},
        category = ${category || null},
        price = ${Number(price) || 0},
        stock = ${Number(stock) || 0},
        min_stock = ${Number(min_stock) || 0},
        unit = ${unit || "pcs"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui produk",
      },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE PRODUK
// ===============================
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return Response.json(
        {
          success: false,
          message: "ID produk tidak valid",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM products
      WHERE id = ${productId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Produk berhasil dihapus",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus produk",
      },
      { status: 500 }
    );
  }
}