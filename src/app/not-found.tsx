import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">404</h2>
      <p className="text-gray-600">页面不存在。</p>
      <Link href="/" className="text-blue-600">
        返回首页
      </Link>
    </div>
  );
}
