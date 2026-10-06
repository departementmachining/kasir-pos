import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        role: true,
        company: true,
        branch: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          message: "Akun Anda tidak aktif. Silakan hubungi Administrator.",
        },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "Akun ini belum memiliki password. Silakan lakukan setup Administrator.",
        },
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        status: user.status,
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
        },
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
              code: user.branch.code,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat login.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
