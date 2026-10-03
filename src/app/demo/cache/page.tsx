import Link from "next/link";
import { getCachedQuote } from "@/lib/cached-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "缓存演示（unstable_cache）| Next.js 全功能演示",
  description: "Next 16：unstable_cache + tags + revalidate 多级缓存",
};

export default async function CacheDemoPage() {
  // 该调用经 unstable_cache 缓存：1 分钟内重复请求复用同一结果（含 tag="quote"）
  const quote = await getCachedQuote();

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-gray-500">
        ← 返回首页
      </Link>
      <h1 className="text-2xl font-bold">缓存演示（unstable_cache）</h1>
      <p className="text-sm text-gray-500">
        函数用 unstable_cache(..., {"{ tags: ['quote'], revalidate: 60 }"})；1 分钟内重复刷新复用结果。
      </p>
      <blockquote className="border-l-4 pl-4 italic text-lg">“{quote}”</blockquote>
      <p className="text-xs text-gray-400">
        想主动失效可调用 <code>{`revalidateTag("quote")`}</code>
        （本项目未在此页接按钮，可按同样模式接一个 Server Action）。
      </p>
    </div>
  );
}
