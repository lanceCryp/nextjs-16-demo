// 结构化 JSON 日志，贯穿请求 ID；绝不记录密码 / 令牌等敏感字段
export function getRequestId(req?: Request): string {
  return req?.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function log(
  level: "info" | "warn" | "error",
  msg: string,
  meta: Record<string, unknown> = {},
): void {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
