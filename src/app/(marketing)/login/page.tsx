import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-sm space-y-3">
      <h1 className="text-2xl font-bold">登录</h1>
      {error ? (
        <p className="text-sm text-red-600">
          登录失败：请检查邮箱与密码（演示密码为 password）
        </p>
      ) : null}
      <form action={loginAction} className="flex flex-col gap-2">
        <input name="email" placeholder="email" className="border rounded p-2" />
        <input
          name="password"
          type="password"
          placeholder="password"
          className="border rounded p-2"
        />
        <button type="submit" className="border rounded p-2 bg-black text-white">
          登录
        </button>
      </form>
      <p className="text-sm text-gray-500">
        演示账户：任意邮箱 + 密码 <code>password</code>
      </p>
    </div>
  );
}
