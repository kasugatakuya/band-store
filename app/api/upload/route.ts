import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 管理者権限チェック
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '画像ファイル（JPEG, PNG, WebP, GIF）のみアップロード可能です' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ユニークなファイル名を生成
    const fileExtension = path.extname(file.name)
    const fileNameWithoutExt = path.basename(file.name, fileExtension)
    const uniqueId = crypto.randomBytes(6).toString('hex')
    const fileName = `${fileNameWithoutExt}-${uniqueId}${fileExtension}`

    // ファイルを保存
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products')
    const filePath = path.join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)

    // クライアントがアクセスするためのURL
    const fileUrl = `/images/products/${fileName}`

    return NextResponse.json({ 
      url: fileUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('アップロードエラー:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}