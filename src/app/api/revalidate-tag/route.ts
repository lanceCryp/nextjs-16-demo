import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// 主动失效缓存：调用 revalidateTag 清除打了对应 tag 的 fetch 缓存。
// 与 /api/fetch-demo 配合——先 GET /api/fetch-demo 拿到带 tag="gh-zen" 的缓存，
// 再 POST 本接口使其失效，下次 fetch-demo 会重新真正请求。
// 注意：Next 16 的 revalidateTag 需要第二个参数（cacheLife profile）。
// 这里传 { expire: 30 }，表示失效后该 tag 的缓存寿命恢复为 30s，与 fetch-demo 的语义一致。
export async function POST() {
  revalidateTag("gh-zen", { expire: 30 });
  return NextResponse.json({ ok: true, revalidatedTags: ["gh-zen"] });
}
