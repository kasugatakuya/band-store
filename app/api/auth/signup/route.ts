import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Roleキーを使用してSupabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "パスワードは6文字以上で設定してください" },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      )
    }

    // Supabaseでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      console.error("Supabase error:", authError)
      return NextResponse.json(
        { error: "アカウントの作成に失敗しました" },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "ユーザーの作成に失敗しました" },
        { status: 500 }
      )
    }

    // Prismaでユーザー情報を保存
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: name,
          role: 'USER'
        }
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Supabaseのユーザーを削除（ロールバック）
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: "データベースエラーが発生しました" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "アカウントが正常に作成されました",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}