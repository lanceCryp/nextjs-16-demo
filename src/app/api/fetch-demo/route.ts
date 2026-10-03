import { NextResponse } from "next/server";

// 演示 fetch 缓存选项：Next 15+ 默认不缓存 fetch，需要显式声明。
//
// 两个分支对比：
//  - cached：next: { revalidate: 30, tags: ["gh-zen"] }  → 30s 内复用，可经 revalidateTag 主动失效
//  - fresh：  cache: "no-store"                          → 每次都真实请求，绝不缓存
export async function GET(req: Request) {
  const mode = new URL(req.url).searchParams.get("mode") ?? "cached";

  try {
    if (mode === "fresh") {
      const res = await fetch("https://api.github.com/zen", { cache: "no-store" });
      const text = await res.text();
      return NextResponse.json({ mode, cached: false, data: text.trim() });
    }

    const res = await fetch("https://api.github.com/zen", {
      next: { revalidate: 30, tags: ["gh-zen"] },
    });
    const text = await res.text();
    return NextResponse.json({ mode, cached: true, tag: "gh-zen", data: text.trim() });
  } catch (e) {
    // 离线 / 网络不通时返回说明，避免 demo 直接 500
    return NextResponse.json(
      {
        mode,
        error: e instanceof Error ? e.message : String(e),
        hint: "fetch 目标为外部站点，离线时会失败；可把 URL 换成站点内部接口来演示缓存语义。",
      },
      { status: 200 },
    );
  }
}
