import { Suspense } from "react";
import Link from "next/link";
import { draftMode } from "next/headers";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { DraftBanner } from "@/components/DraftBanner";

export const metadata: Metadata = {
  title: "Draft Mode 草稿预览 | Next.js 演示",
  description: "草稿模式：写入 __prerender_bypass cookie 绕过静态缓存，预览未发布内容",
};

type Row = { slug: string; title: string; excerpt: string; published: boolean };

async function DraftPanel({ isEnabled }: { isEnabled: boolean }) {
  let posts: Row[] = [];
  let draftCount = 0;

  try {
    // 草稿模式开启时不过滤 published，未发布文章也一并列出
    posts = await prisma.post.findMany({
      where: isEnabled ? {} : { published: true },
      select: { slug: true, title: true, excerpt: true, published: true },
      orderBy: { createdAt: "desc" },
    });
    draftCount = await prisma.post.count({ where: { published: false } });
  } catch {
    posts = [];
  }

  if (posts.length === 0) {
    return (
      <p className="text-gray-500">
        暂无文章。请先运行 <code>pnpm prisma db seed</code>。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.slug} className="border rounded p-3">
          <div className="flex items-center gap-2">
            <Link href={`/demo/draft/${p.slug}`} className="font-medium">
              {p.title}
            </Link>
            {p.published ? null : (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                草稿
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{p.excerpt}</p>
        </li>
      ))}
      {!isEnabled && draftCount > 0 ? (
        <li className="text-sm text-amber-700">
          还有 {draftCount} 篇未发布草稿被隐藏 —— 开启草稿模式即可预览。
        </li>
      ) : null}
    </ul>
  );
}

export default async function DraftDemoPage() {
  // draftMode() 在 Next 15+ 是异步 API；读取它会让本页按请求动态渲染（草稿模式的本质）
  const { isEnabled } = await draftMode();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Draft Mode（草稿预览）</h1>

      {isEnabled ? (
        <DraftBanner />
      ) : (
        <a
          href={`/api/draft/enable?to=${encodeURIComponent("/demo/draft")}`}
          className="inline-block rounded bg-black px-3 py-1.5 text-white"
        >
          开启草稿模式
        </a>
      )}

      <div className="space-y-1 text-sm text-gray-600">
        <p>
          当前状态：<strong>{isEnabled ? "草稿模式已开启" : "正式视图"}</strong>
        </p>
        <p>
          开启时会写入 <code>__prerender_bypass</code> cookie，让请求绕过静态缓存（Full
          Route Cache）按请求重新渲染，从而读到未发布内容 —— 这是 CMS
          「预览未发布草稿」的标准方案。
        </p>
        <p>
          对比：主站 <Link href="/blog" className="underline">/blog</Link>{" "}
          保持静态生成，始终只列已发布文章，不受草稿模式影响（它不读 draftMode）。
        </p>
      </div>

      <Suspense fallback={<p className="text-gray-500">加载文章…</p>}>
        <DraftPanel isEnabled={isEnabled} />
      </Suspense>
    </div>
  );
}
