import { unstable_cache } from "next/cache";

// 演示带 tag + 生命周期的缓存。
// 注：原用 "use cache" 指令，但该指令仅在 next.config 开启 cacheComponents 时可用；
// 现 cacheComponents 已关闭，改用经典可用的 unstable_cache，本质一致：
// - tags: ["quote"]：为缓存条目打标签，便于用 revalidateTag("quote") 主动失效
// - revalidate: 60：每 60 秒再生
export async function getCachedQuote(): Promise<string> {
  return unstable_cache(
    async () => {
      const res = await fetch("https://api.github.com/zen");
      return (await res.text()).trim();
    },
    ["github-zen-quote"],
    { tags: ["quote"], revalidate: 60 },
  )();
}
