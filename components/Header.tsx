"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Music } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Music className="w-6 h-6" />
            Band Store
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost">商品一覧</Button>
            </Link>
            
            {session ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="ghost">注文履歴</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost">管理者</Button>
                </Link>
                <Button variant="outline" onClick={() => signOut()}>
                  ログアウト
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button>ログイン</Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}