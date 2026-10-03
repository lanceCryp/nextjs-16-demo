import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 事务需要 Node Runtime（SQLite 不在 Edge 上跑）
export const runtime = "nodejs";

// 演示 Prisma 事务：在一个原子操作里对两个商品各加价 100。
// 传 { "fail": true } 会在事务内抛错，验证"全部回滚、数据库不变"。
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const shouldFail = body?.fail === true;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const a = await tx.product.update({
        where: { slug: "tshirt" },
        data: { price: { increment: 100 } },
        select: { slug: true, price: true },
      });
      const b = await tx.product.update({
        where: { slug: "mug" },
        data: { price: { increment: 100 } },
        select: { slug: true, price: true },
      });
      if (shouldFail) {
        throw new Error("模拟失败：事务应当整体回滚");
      }
      return { a, b };
    });

    return NextResponse.json({ ok: true, rolledBack: false, result });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        rolledBack: shouldFail,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
