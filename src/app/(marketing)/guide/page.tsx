import type { Metadata } from "next";
import { PitfallExplorer } from "@/components/pitfall-explorer";
import { categoriesWithCount, pitfalls } from "@/lib/pitfalls";

export const metadata: Metadata = {
  title: "避坑指南 | Next.js 演示",
  description: "Next.js 16 开发中常见的坑：症状、根因与解决方案",
};

export default function GuidePage() {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Next.js 避坑指南</h1>
        <p className="max-w-3xl text-gray-600">
          这里收录的 {pitfalls.length} 条全部是本项目在搭建过程中真实踩到并修复的问题，
          每条都包含<b>症状</b>、<b>原因</b>和<b>解决方案</b>。
          它们大多集中在 Next 16 / React 19 / Tailwind 4 的新行为变化上 ——
          很多是「静默失效」而非报错，排查起来尤其费时间。
        </p>
      </header>

      <PitfallExplorer items={pitfalls} categories={categoriesWithCount} />
    </div>
  );
}
