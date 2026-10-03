"use client";

import dynamic from "next/dynamic";

// 关键演示点：ssr:false 让 LiveClock 只在客户端加载，不参与 SSR/首屏包，
// 实现按需代码分割；loading 提供占位，避免加载期间空白。
const LiveClock = dynamic(() => import("./LiveClock"), {
  ssr: false,
  loading: () => <div className="border rounded p-3 text-sm text-gray-400">时钟加载中…</div>,
});

export default function DynamicDemo() {
  return <LiveClock />;
}
