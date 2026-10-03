import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { prisma } from "@/lib/db";

// 取数放进 Suspense 边界：预渲染时先出 fallback，详情再流式补上，
// 避免 cacheComponents 因「预渲染期间访问 connection()」而报错。
async function PhotoContent({ id }: { id: string }) {
  const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
  if (!product) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <div className="relative w-full max-w-md aspect-[4/3] bg-gray-100 rounded">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover rounded"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            无图
          </div>
        )}
      </div>
      <p className="text-gray-600">{product.description}</p>
      <p>价格：¥{product.price / 100}</p>
      <p className="text-xs text-gray-400">这是直接访问（非拦截）时的整页版本。</p>
    </>
  );
}

// 直接访问（非拦截）时的整页版本
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-3">
      <Link href="/gallery" className="text-sm text-gray-500">
        ← 返回画廊
      </Link>
      <Suspense fallback={<p className="text-gray-500">加载详情…（流式占位）</p>}>
        <PhotoContent id={id} />
      </Suspense>
    </div>
  );
}
