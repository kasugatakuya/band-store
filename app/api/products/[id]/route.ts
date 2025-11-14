import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().positive(),
  image: z.string().nullable().optional(),
  type: z.enum(['CD', 'CLOTHING', 'GOODS']),
  stock: z.number().int().nonnegative(),
  featured: z.boolean(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('商品取得エラー:', error)
    return NextResponse.json(
      { error: 'データベースエラー' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 管理者権限の確認
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
    }

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'データが不正です', details: error.errors },
        { status: 400 }
      )
    }
    console.error('商品更新エラー:', error)
    return NextResponse.json(
      { error: 'データベースエラー' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 管理者権限の確認
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
    }

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '商品を削除しました' })
  } catch (error) {
    console.error('商品削除エラー:', error)
    return NextResponse.json(
      { error: 'データベースエラー' },
      { status: 500 }
    )
  }
}