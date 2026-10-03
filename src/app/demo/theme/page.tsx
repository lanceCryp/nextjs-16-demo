import type { Metadata } from "next";
import { ThemeState } from "@/components/theme-state";
import { paletteDots, paletteNames } from "@/lib/theme";

export const metadata: Metadata = {
  title: "主题切换 | Next.js 演示",
  description: "next-themes 明暗模式 + 品牌配色双轴主题，避免刷新闪烁",
};

export default function ThemeDemoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">主题切换（明暗 + 品牌配色）</h1>

      <p className="text-gray-600 max-w-2xl">
        主题被拆成两个<strong>正交</strong>的维度：明暗（亮 / 暗 / 跟随系统）由
        <code>next-themes</code> 管理，它把 <code>.light</code> /{" "}
        <code>.dark</code> 类挂到 <code>&lt;html&gt;</code> 上，供 Tailwind
        的 <code>dark:</code> 变体使用；品牌配色则由{" "}
        <code>data-palette</code> 属性驱动。
        两者互不干扰，所以「海蓝 + 暗色」这类组合都成立。
      </p>

      <div className="theme-card max-w-2xl space-y-3 rounded border p-4">
        <h2 className="font-medium">当前主题状态</h2>
        <ThemeState />
        <p className="text-xs text-muted">
          提示：把鼠标移到右上角工具条可切换；或直接改系统主题，看「跟随系统」如何联动。
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">品牌配色预览</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(paletteDots).map(([key, color]) => (
            <div
              key={key}
              className="theme-card flex items-center gap-2 rounded border px-3 py-2 text-sm"
            >
              <span
                className="block h-3.5 w-3.5 rounded-full"
                style={{ background: color }}
              />
              {paletteNames[key as keyof typeof paletteNames]}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl space-y-2 text-sm text-gray-600">
        <h2 className="font-medium text-fg">实现要点</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>防闪烁（FOUC）</strong>：服务端渲染时不知道用户主题。
            根布局的 <code>&lt;head&gt;</code> 里放了一段同步内联脚本，
            在首屏绘制前就把 <code>data-palette</code> 写好；明暗轴由
            next-themes 自带的同款脚本处理。
          </li>
          <li>
            <strong>hydration</strong>：<code>&lt;html&gt;</code> 加了{" "}
            <code>suppressHydrationWarning</code>，且切换器在挂载前不渲染高亮状态，
            避免服务端与客户端不一致。
          </li>
          <li>
            <strong>Tailwind 4</strong>：需用{" "}
            <code>@custom-variant dark</code> 把 <code>dark:</code>{" "}
            显式绑定到 <code>.dark</code> 类，否则变体不生效。
          </li>
          <li>
            <strong>无 JS 降级</strong>：<code>html</code> 上还没有类名时，
            靠 <code>prefers-color-scheme</code> 媒体查询跟随系统。
          </li>
        </ul>
      </div>
    </div>
  );
}
