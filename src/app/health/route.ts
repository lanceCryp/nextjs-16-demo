import { NextResponse } from "next/server";

// 存活探针：不依赖外部资源
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "nextjs-feature-showcase",
    time: new Date().toISOString(),
  });
}
