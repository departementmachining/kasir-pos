import sql from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ===============================
// UPDATE PELANGGAN
// ===============================
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const customerId = Number(id);

    if (!Number.isInteger(customerId)) {
      return Response.json(
        {
          success: false,
          message: "ID pelanggan tidak valid",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      code,
      name,
      phone,
      email,
      address,
    } = body;

    if (!code || !name) {
      return Response.json(
        {
          success: false,
          message: "Kode dan nama pelanggan wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE customers
      SET
        code = ${code},
        name = ${name},
        phone = ${phone || null},
        email = ${email || null},
        address = ${address || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${customerId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Pelanggan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Pelanggan berhasil diperbarui",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui pelanggan",
      },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE PELANGGAN
// ===============================
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const customerId = Number(id);

    if (!Number.isInteger(customerId)) {
      return Response.json(
        {
          success: false,
          message: "ID pelanggan tidak valid",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM customers
      WHERE id = ${customerId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Pelanggan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Pelanggan berhasil dihapus",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus pelanggan",
      },
      { status: 500 }
    );
  }
}