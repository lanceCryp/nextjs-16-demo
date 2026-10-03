import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { prisma } from "@/lib/db";
import ModalClose from "@/components/ModalClose";

// 取数放进 Suspense 边界：预渲染时先出 fallback，模态内容再流式补上，
// 避免 cacheComponents 因「预渲染期间访问 connection()」而报错。
async function ModalContent({ id }: { id: string }) {
  const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
  if (!product) notFound();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{product.title}</h2>
        <ModalClose />
      </div>
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded">
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
      <p className="text-xs text-gray-400">
        这是拦截路由渲染的模态：URL 保持 /gallery，但叠加了 photo 段。点击「关闭」回到画廊。
      </p>
    </>
  );
}

// 拦截路由：(.) 匹配与当前同级（gallery）的 photo/[id]，从画廊内导航时以模态呈现
export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded p-6 max-w-md w-full space-y-3">
        <Suspense fallback={<p className="text-gray-500">加载详情…（流式占位）</p>}>
          <ModalContent id={id} />
        </Suspense>
      </div>
    </div>
  );
}
