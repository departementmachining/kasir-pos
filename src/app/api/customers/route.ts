import sql from "@/lib/db";

// ===============================
// GET SEMUA PELANGGAN
// ===============================
export async function GET() {
  try {
    const customers = await sql`
      SELECT
        id,
        code,
        name,
        phone,
        email,
        address,
        created_at,
        updated_at
      FROM customers
      ORDER BY id DESC
    `;

    return Response.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data pelanggan",
      },
      { status: 500 }
    );
  }
}

// ===============================
// TAMBAH PELANGGAN
// ===============================
export async function POST(request: Request) {
  try {
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
      INSERT INTO customers (
        code,
        name,
        phone,
        email,
        address
      )
      VALUES (
        ${code},
        ${name},
        ${phone || null},
        ${email || null},
        ${address || null}
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      message: "Pelanggan berhasil ditambahkan",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan pelanggan",
      },
      { status: 500 }
    );
  }
}