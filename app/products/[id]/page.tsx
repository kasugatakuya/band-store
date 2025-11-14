import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/AddToCartButton";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-2xl">画像なし</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-600 mb-2">
            {product.type === "CD" ? "CD" : 
             product.type === "CLOTHING" ? "服" : "雑貨"}
          </p>
          <p className="text-3xl font-bold mb-6">¥{product.price.toLocaleString('ja-JP')}</p>

          {product.description && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">商品説明</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              在庫:{" "}
              {product.stock > 0
                ? `${product.stock}個在庫あり`
                : "在庫切れ"}
            </p>
          </div>

          <AddToCartButton
            productId={product.id}
            disabled={product.stock === 0}
          />
        </div>
      </div>
    </div>
  );
}
