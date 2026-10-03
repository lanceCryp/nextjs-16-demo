"use client";

import { useTheme } from "next-themes";
import { usePalette } from "@/components/theme-provider";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { paletteNames } from "@/lib/theme";

export function ThemeState() {
  const { theme, resolvedTheme } = useTheme();
  const { palette } = usePalette();

  // 服务端没有主题信息，挂载完成前只显示占位，避免 hydration 不一致
  const hydrated = useIsHydrated();
  if (!hydrated) {
    return <p className="text-sm text-muted">读取主题状态…</p>;
  }

  const rows: [string, string][] = [
    ["偏好（theme）", theme ?? "未设置"],
    ["实际生效（resolvedTheme）", resolvedTheme ?? "未解析"],
    ["品牌配色（data-palette）", paletteNames[palette]],
    ["<html> 上的类名", document.documentElement.className || "（空）"],
    [
      "<html> 的 data-palette",
      document.documentElement.getAttribute("data-palette") ?? "（未设置）",
    ],
  ];

  return (
    <dl className="space-y-1 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="w-44 shrink-0 text-muted">{k}</dt>
          <dd className="font-mono text-xs">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
