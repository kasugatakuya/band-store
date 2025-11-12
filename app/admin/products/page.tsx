import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/auth/signin");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }

  if (user && user.role !== "ADMIN") {
    redirect("/");
  }

  let products = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <Link href="/admin/products/new">
          <Button>新しい商品を追加</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center p-4">
              <div className="relative w-16 h-16 mr-4">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">画像なし</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  {product.type === "ALBUM" ? "アルバム" : "Tシャツ"} - ¥
                  {product.price.toLocaleString('ja-JP')} - 在庫: {product.stock}
                </p>
              </div>

              <Link href={`/admin/products/${product.id}/edit`}>
                <Button variant="outline" size="sm">
                  編集
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
