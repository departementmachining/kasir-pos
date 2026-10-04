import sql from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS waktu`;

    return Response.json({
      success: true,
      message: "Koneksi Neon berhasil",
      waktu: result[0].waktu,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Koneksi Neon gagal",
      },
      { status: 500 }
    );
  }
}