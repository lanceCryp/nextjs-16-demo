// 主题品牌色轴（与 next-themes 管的明暗轴正交）
// next-themes 一次只能接管一个 html 属性（attribute="class" 已用于明暗），
// 因此第二个维度「品牌配色」用 data-palette 属性 + localStorage 自行实现。

export const PALETTE_KEY = "palette";

export const palettes = ["default", "ocean", "forest", "sunset"] as const;
export type Palette = (typeof palettes)[number];

export const paletteNames: Record<Palette, string> = {
  default: "素白",
  ocean: "海蓝",
  forest: "森野",
  sunset: "暮橙",
};

// 切换器上的色点
export const paletteDots: Record<Palette, string> = {
  default: "#a3a3a3",
  ocean: "#0ea5e9",
  forest: "#22c55e",
  sunset: "#f97316",
};

export function isPalette(value: unknown): value is Palette {
  return (
    typeof value === "string" && (palettes as readonly string[]).includes(value)
  );
}
