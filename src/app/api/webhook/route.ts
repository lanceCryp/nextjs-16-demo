import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { after } from "next/server";

export const dynamic = "force-dynamic";

// 演示接收第三方 Webhook（如支付回调）。真实场景应先校验签名再处理业务。
export async function POST(req: Request) {
  const sig = req.headers.get("x-signature");
  const payload = await req.text();

  after(() =>
    log("info", "webhook processed", {
      signature: sig ? "present" : "missing",
      length: payload.length,
    }),
  );

  return NextResponse.json({ received: true });
}
