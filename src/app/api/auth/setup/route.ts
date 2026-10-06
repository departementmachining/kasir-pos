import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Nama, email, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          message: "Nama minimal 2 karakter.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email tersebut sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const existingAdministrator = await prisma.user.findFirst({
      where: {
        role: {
          name: "Administrator",
        },
      },
      include: {
        role: true,
      },
    });

    if (existingAdministrator) {
      return NextResponse.json(
        {
          message:
            "Administrator sudah tersedia. Silakan gunakan halaman login.",
        },
        { status: 409 }
      );
    }

    const company = await prisma.company.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          message:
            "Data perusahaan belum tersedia. Silakan isi data toko terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: {
          companyId_name: {
            companyId: company.id,
            name: "Administrator",
          },
        },
        update: {
          description:
            "Administrator dengan akses penuh ke sistem POS.",
        },
        create: {
          companyId: company.id,
          name: "Administrator",
          description:
            "Administrator dengan akses penuh ke sistem POS.",
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          roleId: role.id,
          name,
          email,
          passwordHash,
          status: "ACTIVE",
        },
        include: {
          role: true,
          company: true,
        },
      });

      return {
        user,
        role,
      };
    });

    return NextResponse.json(
      {
        message: "Administrator berhasil dibuat.",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          status: result.user.status,
          role: result.role.name,
          company: result.user.company.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/setup error:", error);

    return NextResponse.json(
      {
        message: "Gagal membuat Administrator.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
