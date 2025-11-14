import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    const orderItemsData = session.metadata?.orderItems;
    const shippingAddressData = session.metadata?.shippingAddress;

    if (!userId || !orderItemsData || !shippingAddressData) {
      console.error(
        "Missing userId, orderItems, or shippingAddress in session metadata"
      );
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    try {
      // 注文アイテムをパース
      const orderItems = JSON.parse(orderItemsData);

      // 住所情報をパース
      const shippingAddress = JSON.parse(shippingAddressData);

      // トランザクションで注文と注文アイテムを作成
      const order = await prisma.$transaction(async (tx) => {
        // 注文を作成
        const newOrder = await tx.order.create({
          data: {
            userId,
            stripePaymentId: session.payment_intent as string,
            total: session.amount_total || 0, // 日本円は最小単位が1円なので100で割る必要なし
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
          where: { userId },
        });

        return newOrder;
      });

      console.log(`Order ${order.id} created with items for user ${userId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        { error: "Error creating order" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
