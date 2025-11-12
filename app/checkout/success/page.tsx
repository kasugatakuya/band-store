import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface PageProps {
  searchParams: {
    session_id?: string;
  };
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/auth/signin");
  }

  const sessionId = searchParams.session_id;

  if (sessionId) {
    try {
      // Stripeセッション情報を取得
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "line_items.data.price.product"],
      });

      if (
        stripeSession.payment_status === "paid" &&
        stripeSession.metadata?.userId === session.user.id
      ) {
        // 既存の注文がないかチェック
        const existingOrder = await prisma.order.findFirst({
          where: { stripePaymentId: stripeSession.payment_intent as string },
        });

        if (!existingOrder) {
          // 注文データとメタデータから注文アイテムを取得
          const orderItemsData = stripeSession.metadata?.orderItems;

          if (orderItemsData) {
            const orderItems = JSON.parse(orderItemsData);

            // 住所情報
            const shippingAddress = {
              name: stripeSession.customer_details?.name || null,
              email: stripeSession.customer_details?.email || null,
              address: stripeSession.customer_details?.address
                ? {
                    line1: stripeSession.customer_details.address.line1,
                    line2: stripeSession.customer_details.address.line2,
                    city: stripeSession.customer_details.address.city,
                    state: stripeSession.customer_details.address.state,
                    postal_code:
                      stripeSession.customer_details.address.postal_code,
                    country: stripeSession.customer_details.address.country,
                  }
                : null,
            };

            // トランザクションで注文と注文アイテムを作成
            await prisma.$transaction(async (tx) => {
              // 注文を作成
              const newOrder = await tx.order.create({
                data: {
                  userId: session.user.id,
                  stripePaymentId: stripeSession.payment_intent as string,
                  total: stripeSession.amount_total || 0, // 日本円は最小単位が1円なので100で割る必要なし
                  status: "PROCESSING",
                  shippingAddress,
                },
              });

              // 注文アイテムを作成
              for (const item of orderItems) {
                const product = await tx.product.findUnique({
                  where: { id: item.productId },
                });

                if (product) {
                  await tx.orderItem.create({
                    data: {
                      orderId: newOrder.id,
                      productId: item.productId,
                      quantity: item.quantity,
                      price: product.price,
                    },
                  });
                }
              }

              // カートをクリア
              await tx.cart.deleteMany({
                where: { userId: session.user.id },
              });
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing successful checkout:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">決済完了！</h1>
          <p className="text-gray-600 mb-6">
            ご注文ありがとうございます。カートがクリアされ、購入履歴に追加されました。
          </p>
          <div className="space-y-2">
            <div className="mb-4">
              <Link href="/products">
                <Button className="w-full">商品を見る</Button>
              </Link>
            </div>
            <div>
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  注文履歴を見る
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
