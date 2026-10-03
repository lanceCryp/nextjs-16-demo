import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

// 数据库读取放在 Suspense 边界内：预渲染时先出 fallback，真实数据再流式补上，
// 避免 cacheComponents 因「预渲染期间访问 connection()」而报错。
async function GalleryGrid() {
  let products: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
  }[] = [];
  try {
    products = await prisma.product.findMany({
      select: { id: true, title: true, description: true, price: true, imageUrl: true },
    });
  } catch {
    products = [];
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/gallery/photo/${p.id}`}
          className="border rounded overflow-hidden block hover:bg-gray-50"
        >
          <div className="relative w-full aspect-[4/3] bg-gray-100">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                无图
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">¥{p.price / 100}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">画廊（并行路由 + 拦截路由 + next/image）</h1>
      <p className="text-gray-500">
        点击图片会以模态框打开（拦截路由）；直接访问 /gallery/photo/[id] 则是整页。
      </p>
      <Suspense fallback={<p className="text-gray-500">加载画廊…（流式占位）</p>}>
        <GalleryGrid />
      </Suspense>
    </div>
  );
}
