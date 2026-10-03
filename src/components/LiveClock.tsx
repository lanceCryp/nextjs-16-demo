"use client";

import { useEffect, useState } from "react";

// 仅客户端的组件：每秒跳动的时钟。
// 故意放重一点（渲染 1000 个节点），体现"动态导入做代码分割、首屏不下载"的价值。
export default function LiveClock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="border rounded p-3 text-sm">
      <div className="text-gray-500">客户端动态导入的时钟（next/dynamic ssr:false）</div>
      <div className="text-lg font-mono tabular-nums">{now}</div>
    </div>
  );
}
