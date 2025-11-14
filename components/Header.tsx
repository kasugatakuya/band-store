"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Music, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={closeMenu}>
            <Music className="w-6 h-6" />
            Band Store
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
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
                <Link href="/profile">
                  <Button variant="ghost">プロフィール</Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost">管理者</Button>
                  </Link>
                )}
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">ログイン</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>新規登録</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {session && (
              <Link href="/cart" onClick={closeMenu}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-12 h-12 p-0"
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                <Link href="/products" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start">商品一覧</Button>
                </Link>

                {session ? (
                  <>
                    <Link href="/orders" onClick={closeMenu}>
                      <Button variant="ghost" className="w-full justify-start">注文履歴</Button>
                    </Link>
                    <Link href="/profile" onClick={closeMenu}>
                      <Button variant="ghost" className="w-full justify-start">プロフィール</Button>
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">管理者</Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => {
                        closeMenu();
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      ログアウト
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={closeMenu}>
                      <Button variant="ghost" className="w-full justify-start">ログイン</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={closeMenu}>
                      <Button className="w-full justify-start">新規登録</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
