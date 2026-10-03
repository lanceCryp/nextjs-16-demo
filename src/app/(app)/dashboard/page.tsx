import { auth } from "@/auth";
import { redirect } from "next/navigation";

// 用到 auth()（间接读取 cookies）→ 在 Cache Components 下必须显式声明动态
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">后台</h1>
      <p>已登录用户：{session.user.email}</p>
      <p className="text-sm text-gray-500">
        本页受 Middleware（matcher 命中 /dashboard）与页面内 auth() 双重保护。
      </p>
    </div>
  );
}
