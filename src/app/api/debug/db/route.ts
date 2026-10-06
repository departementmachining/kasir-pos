import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.$queryRaw<
      Array<{
        schemaname: string;
        tablename: string;
      }>
    >`
      SELECT schemaname, tablename
      FROM pg_catalog.pg_tables
      WHERE tablename IN (
        'users',
        'roles',
        'companies',
        'company_settings',
        'branches'
      )
      ORDER BY schemaname, tablename
    `;

    const columns = await prisma.$queryRaw<
      Array<{
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>
    >`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'roles')
      ORDER BY table_name, ordinal_position
    `;

    return NextResponse.json({
      tables,
      columns,
    });
  } catch (error) {
    console.error("DB DEBUG ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
