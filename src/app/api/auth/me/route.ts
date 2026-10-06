import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastLoginAt: user.lastLoginAt,

        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              description: user.role.description,
            }
          : null,

        company: {
          id: user.company.id,
          name: user.company.name,
          logoUrl: user.company.logoUrl,
        },

        branch: user.branch
          ? {
              id: user.branch.id,
              code: user.branch.code,
              name: user.branch.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Gagal mengambil data pengguna.",
      },
      { status: 500 }
    );
  }
}
