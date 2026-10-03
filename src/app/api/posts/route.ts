import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { log } from "@/lib/logger";
import { after } from "next/server";

// GET 走缓存：每 60s 再生（经典 Route Handler 缓存写法）
export const revalidate = 60;

export async function GET() {
  const posts = await prisma.post
    .findMany({
      where: { published: true },
      select: { slug: true, title: true },
      take: 20,
    })
    .catch(() => []);
  return NextResponse.json({ source: "cacheable", revalidate: 60, posts });
}

// POST 为变更操作，自动动态、不缓存；并做 zod 边界校验
const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "校验失败", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.content.slice(0, 50),
      slug: crypto.randomUUID().slice(0, 8),
      published: false,
    },
  });

  // after()：请求返回后再做（日志/埋点），不阻塞响应
  after(() => log("info", "post created", { id: post.id }));

  return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
}
