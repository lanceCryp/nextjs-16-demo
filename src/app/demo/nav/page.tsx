"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function NavHooks() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");

  // useSearchParams：读取当前 URL 的查询参数（这里演示 ?q=）
  const q = searchParams.get("q") ?? "";

  function goWithQuery() {
    // useRouter：编程式导航，带查询参数（等价于 <Link href="?q=...">）
    router.push(`${pathname}?q=${encodeURIComponent(input)}`);
  }

  return (
    <div className="space-y-4">
      <dl className="text-sm space-y-1">
        <div className="flex gap-2">
          <dt className="font-medium w-32">usePathname</dt>
          <dd className="text-gray-700">{pathname}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium w-32">useSearchParams</dt>
          <dd className="text-gray-700">q = “{q}”</dd>
        </div>
      </dl>

      <div className="flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入关键词"
          className="border rounded px-2 py-1 text-sm"
        />
        <button
          onClick={goWithQuery}
          className="bg-black text-white text-sm rounded px-3 py-1"
        >
          router.push(?q=)
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="border rounded px-3 py-1 text-sm"
        >
          router.back()
        </button>
        <button
          onClick={() => router.refresh()}
          className="border rounded px-3 py-1 text-sm"
        >
          router.refresh()
        </button>
      </div>

      <p className="text-xs text-gray-400">
        useRouter 用于编程式导航（按钮触发）；usePathname 实时反映当前路径；
        useSearchParams 读取查询参数。对比下方 next/link 的声明式导航。
      </p>

      <Link href="/demo/nav?q=hello" className="text-sm text-blue-600 underline">
        用 next/link 跳到 ?q=hello
      </Link>
    </div>
  );
}

export default function NavDemoPage() {
  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-gray-500">
        ← 返回首页
      </Link>
      <h1 className="text-2xl font-bold">客户端导航钩子演示</h1>
      {/* useSearchParams 在静态渲染时必须包在 Suspense 内，否则构建报错 */}
      <Suspense fallback={<p className="text-gray-500">加载导航钩子…</p>}>
        <NavHooks />
      </Suspense>
    </div>
  );
}
