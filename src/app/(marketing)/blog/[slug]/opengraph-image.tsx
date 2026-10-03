import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// 动态 OG 图需读库，标记为动态渲染，避免 cacheComponents 预渲染期访问 connection() 报错
export const dynamic = "force-dynamic";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post
    .findUnique({ where: { slug }, select: { title: true } })
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: 48,
        }}
      >
        {post?.title ?? "文章"}
      </div>
    ),
    size,
  );
}
