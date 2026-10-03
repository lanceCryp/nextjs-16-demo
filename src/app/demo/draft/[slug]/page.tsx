import { notFound } from "next/navigation";
import Link from "next/link";
import { draftMode } from "next/headers";
import { prisma } from "@/lib/db";
import { DraftBanner } from "@/components/DraftBanner";

// 草稿预览专用动态路由：任意 slug 都可渲染（含未发布）。
export default async function DraftPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();

  const post = await prisma.post.findUnique({ where: { slug } }).catch(() => null);

  // 未开启草稿模式时，未发布文章一律不可见（返回 404）
  if (!post || (!isEnabled && !post.published)) notFound();

  return (
    <article className="space-y-3">
      {isEnabled ? <DraftBanner to={`/demo/draft/${slug}`} /> : null}

      <Link href="/demo/draft" className="text-sm text-gray-500">
        ← 返回草稿预览
      </Link>

      <h1 className="text-2xl font-bold">{post.title}</h1>

      {post.published ? null : (
        <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
          草稿（未发布）
        </span>
      )}

      <p className="text-gray-500">{post.excerpt}</p>
      <div className="whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}
