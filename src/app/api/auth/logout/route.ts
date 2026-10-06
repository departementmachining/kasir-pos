import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Logout berhasil.",
    });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal melakukan logout.",
      },
      { status: 500 }
    );
  }
}
