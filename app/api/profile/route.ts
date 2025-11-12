import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        phone: true,
        zipCode: true,
        prefecture: true,
        city: true,
        addressLine1: true,
        addressLine2: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("プロフィールの取得に失敗しました:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, zipCode, prefecture, city, addressLine1, addressLine2 } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || null,
        phone: phone || null,
        zipCode: zipCode || null,
        prefecture: prefecture || null,
        city: city || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        zipCode: true,
        prefecture: true,
        city: true,
        addressLine1: true,
        addressLine2: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("プロフィールの更新に失敗しました:", error);
    return NextResponse.json({ 
      error: "サーバーエラー", 
      details: error instanceof Error ? error.message : "不明なエラー" 
    }, { status: 500 });
  }
}