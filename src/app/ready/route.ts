import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 就绪探针：校验数据库连通
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", db: "up" });
  } catch {
    return NextResponse.json({ status: "not ready", db: "down" }, { status: 503 });
  }
}
