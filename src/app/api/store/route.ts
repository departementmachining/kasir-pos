import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SettingItem = {
  key: string;
  value: unknown;
};

function readSetting(
  settings: SettingItem[],
  keys: string[]
): string | null {
  for (const key of keys) {
    const setting = settings.find(
      (item) => item.key === key
    );

    if (
      !setting ||
      setting.value === null ||
      setting.value === undefined
    ) {
      continue;
    }

    if (typeof setting.value === "string") {
      const value = setting.value.trim();

      if (value) {
        return value;
      }
    }

    if (
      typeof setting.value === "object" &&
      setting.value !== null &&
      "value" in setting.value
    ) {
      const value = (
        setting.value as {
          value?: unknown;
        }
      ).value;

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        return value.trim();
      }
    }
  }

  return null;
}

function createInitials(
  name: string
): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "NT";
  }

  if (words.length === 2) {
    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  }

  if (words.length >= 3) {
    return words
      .slice(0, 3)
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .toUpperCase();
  }

  return words[0]
    .substring(0, 2)
    .toUpperCase();
}

/* =====================================================
   GET
   ===================================================== */

export async function GET() {
  try {
    const company =
      await prisma.company.findFirst({
        orderBy: {
          createdAt: "asc",
        },
        include: {
          settings: true,
        },
      });

    if (!company) {
      return NextResponse.json(
        {
          message:
            "Data toko belum tersedia",
          store: null,
        },
        {
          status: 404,
        }
      );
    }

    const tagline =
      readSetting(
        company.settings,
        [
          "tagline",
          "store_tagline",
          "storeTagline",
        ]
      ) || "";

    const initials =
      readSetting(
        company.settings,
        [
          "initials",
          "store_initials",
          "storeInitials",
        ]
      ) ||
      createInitials(
        company.name
      );

    return NextResponse.json({
      store: {
        name: company.name,
        tagline,
        logo: company.logoUrl || "",
        initials,
        address:
          company.address || "",
        phone:
          company.phone || "",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/store error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal mengambil data toko",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   PUT
   ===================================================== */

export async function PUT(
  request: Request
) {
  try {
    const body =
      await request.json();

    const storeName =
      typeof body.storeName ===
      "string"
        ? body.storeName.trim()
        : "";

    const tagline =
      typeof body.tagline ===
      "string"
        ? body.tagline.trim()
        : "";

    const address =
      typeof body.address ===
      "string"
        ? body.address.trim()
        : "";

    const phone =
      typeof body.phone ===
      "string"
        ? body.phone.trim()
        : "";

    const logo =
      typeof body.logo ===
      "string"
        ? body.logo
        : "";

    if (!storeName) {
      return NextResponse.json(
        {
          message:
            "Nama toko wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Cari perusahaan/toko utama.
     */

    const company =
      await prisma.company.findFirst({
        orderBy: {
          createdAt: "asc",
        },
      });

    if (!company) {
      return NextResponse.json(
        {
          message:
            "Data toko belum tersedia.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Buat initials otomatis
     * berdasarkan nama toko.
     */

    const initials =
      createInitials(
        storeName
      );

    /*
     * Simpan semuanya dalam
     * satu transaction.
     */

    const updated =
      await prisma.$transaction(
        async (tx) => {
          const updatedCompany =
            await tx.company.update({
              where: {
                id: company.id,
              },

              data: {
                name: storeName,

                address:
                  address || null,

                phone:
                  phone || null,

                logoUrl:
                  logo || null,
              },
            });

          /*
           * TAGLINE
           */

          await tx.companySetting.upsert(
            {
              where: {
                companyId_key: {
                  companyId:
                    company.id,

                  key: "tagline",
                },
              },

              create: {
                companyId:
                  company.id,

                key: "tagline",

                value: tagline,
              },

              update: {
                value: tagline,
              },
            }
          );

          /*
           * INITIALS
           */

          await tx.companySetting.upsert(
            {
              where: {
                companyId_key: {
                  companyId:
                    company.id,

                  key: "initials",
                },
              },

              create: {
                companyId:
                  company.id,

                key: "initials",

                value: initials,
              },

              update: {
                value: initials,
              },
            }
          );

          return updatedCompany;
        }
      );

    return NextResponse.json({
      message:
        "Pengaturan toko berhasil disimpan.",

      store: {
        name: updated.name,

        tagline,

        logo:
          updated.logoUrl || "",

        initials,

        address:
          updated.address || "",

        phone:
          updated.phone || "",
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/store error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal menyimpan pengaturan toko.",

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}