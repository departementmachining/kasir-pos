import sql from "@/lib/db";

// ===============================
// GET SEMUA SUPPLIER
// ===============================
export async function GET() {
  try {
    const suppliers = await sql`
      SELECT
        id,
        code,
        name,
        contact,
        phone,
        address,
        created_at,
        updated_at
      FROM suppliers
      ORDER BY id DESC
    `;

    return Response.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data supplier",
      },
      { status: 500 }
    );
  }
}

// ===============================
// TAMBAH SUPPLIER
// ===============================
export async function POST(request: Request) {
  try {
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
      INSERT INTO suppliers (
        code,
        name,
        contact,
        phone,
        address
      )
      VALUES (
        ${code},
        ${name},
        ${contact || null},
        ${phone || null},
        ${address || null}
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      message: "Supplier berhasil ditambahkan",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan supplier",
      },
      { status: 500 }
    );
  }
}