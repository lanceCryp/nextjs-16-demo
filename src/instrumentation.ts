// Next.js 可观测性入口：服务端启动时执行一次（无需在 next.config 开 experimental）。
// 常用于：挂 OpenTelemetry、初始化连接池、打印启动日志。
// register 会在 nodejs 与 edge 两种运行时都调用，故用 NEXT_RUNTIME 区分。

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 动态导入，避免 edge 运行时被强制加载仅 node 的依赖
    const { log } = await import("@/lib/logger");
    log("info", "instrumentation.register: server started", {
      node: process.version,
      env: process.env.NODE_ENV,
    });
  }
}
