"use client";

import { useTheme } from "next-themes";
import { usePalette } from "@/components/theme-provider";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { paletteDots, paletteNames, palettes } from "@/lib/theme";

const MODES = [
  { value: "light", label: "亮" },
  { value: "dark", label: "暗" },
  { value: "system", label: "跟随系统" },
] as const;

export function ThemeControls() {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();

  // 服务端不知道用户主题（类由内联脚本在客户端添加），
  // 挂载完成前不渲染，避免服务端与客户端输出不一致。
  const hydrated = useIsHydrated();
  if (!hydrated) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-line bg-card px-2 py-1.5 text-sm shadow-sm">
      <div className="flex items-center gap-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setTheme(m.value)}
            aria-pressed={theme === m.value}
            className={
              theme === m.value
                ? "rounded bg-accent px-2 py-0.5 text-white"
                : "rounded px-2 py-0.5 text-muted hover:text-fg"
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <span className="h-4 w-px bg-line" aria-hidden />

      <div className="flex items-center gap-1">
        {palettes.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPalette(p)}
            title={paletteNames[p]}
            aria-label={`配色：${paletteNames[p]}`}
            aria-pressed={palette === p}
            className={
              palette === p
                ? "rounded-full p-0.5 ring-2 ring-accent"
                : "rounded-full p-0.5 hover:ring-1 hover:ring-line"
            }
          >
            <span
              className="block h-3.5 w-3.5 rounded-full"
              style={{ background: paletteDots[p] }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
