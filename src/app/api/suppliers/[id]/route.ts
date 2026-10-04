import sql from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ===============================
// UPDATE SUPPLIER
// ===============================
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const supplierId = Number(id);

    if (!Number.isInteger(supplierId)) {
      return Response.json(
        {
          success: false,
          message: "ID supplier tidak valid",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      code,
      name,
      contact,
      phone,
      address,
    } = body;

    if (!code || !name) {
      return Response.json(
        {
          success: false,
          message: "Kode dan nama supplier wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE suppliers
      SET
        code = ${code},
        name = ${name},
        contact = ${contact || null},
        phone = ${phone || null},
        address = ${address || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${supplierId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Supplier berhasil diperbarui",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui supplier",
      },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE SUPPLIER
// ===============================
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const supplierId = Number(id);

    if (!Number.isInteger(supplierId)) {
      return Response.json(
        {
          success: false,
          message: "ID supplier tidak valid",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM suppliers
      WHERE id = ${supplierId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Supplier berhasil dihapus",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus supplier",
      },
      { status: 500 }
    );
  }
}