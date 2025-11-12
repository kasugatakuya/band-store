"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Music } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();

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
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
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
  );
}
