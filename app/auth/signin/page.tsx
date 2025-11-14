"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setMessage("登録が完了しました。ログインしてください。")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn("credentials", { email, password, callbackUrl: "/" })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 pt-0">
      <Card className="w-[400px] mx-4">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>アカウントにアクセスするための情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="text-green-600 text-sm p-3 bg-green-50 rounded-md">
                {message}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              ログイン
            </Button>
            
            <div className="text-center text-sm">
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                新規登録
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}