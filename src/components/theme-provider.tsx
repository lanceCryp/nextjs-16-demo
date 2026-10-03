"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { PALETTE_KEY, isPalette, type Palette } from "@/lib/theme";

/**
 * 品牌色轴以 DOM 属性为唯一真实来源：
 * 内联脚本 → <html data-palette> → CSS 变量，三者天然一致。
 *
 * 这里用 useSyncExternalStore 直接「订阅 DOM 属性」：
 * 写入时改属性并派发事件，读取时走 getSnapshot。
 * 相比 useState + useEffect 同步，少一次渲染，也不触碰 hydration 问题。
 *
 * 之所以不用 next-themes 管这一轴：它的 attribute 无论传单个还是数组，
 * 都只对应**一个**主题值，无法同时表达「明暗」和「配色」两个正交维度。
 */
const PALETTE_EVENT = "app:palettechange";

function subscribePalette(onStoreChange: () => void) {
  window.addEventListener(PALETTE_EVENT, onStoreChange);
  return () => window.removeEventListener(PALETTE_EVENT, onStoreChange);
}

function getPaletteSnapshot(): Palette {
  const attr = document.documentElement.getAttribute("data-palette");
  return isPalette(attr) ? attr : "default";
}

export function usePalette() {
  const palette = useSyncExternalStore(
    subscribePalette,
    getPaletteSnapshot,
    () => "default" as Palette,
  );

  const setPalette = useCallback((next: Palette) => {
    document.documentElement.setAttribute("data-palette", next);
    try {
      window.localStorage.setItem(PALETTE_KEY, next);
    } catch {
      // 隐私模式下 localStorage 可能不可写；属性已生效，仅无法持久化
    }
    window.dispatchEvent(new Event(PALETTE_EVENT));
  }, []);

  return { palette, setPalette };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 明暗轴交给 next-themes：把 .light / .dark 类挂到 <html>，供 Tailwind dark: 变体使用
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}
