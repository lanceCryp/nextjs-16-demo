// Edge Runtime 示例：无数据库依赖，靠近用户运行
export const runtime = "edge";

export async function GET() {
  return Response.json({
    runtime: "edge",
    region: "global",
    time: new Date().toISOString(),
  });
}
