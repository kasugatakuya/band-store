"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
  name?: string;
  email: string;
  phone?: string;
  zipCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile({
          ...data,
          email: session?.user?.email || data.email,
          name: session?.user?.name || data.name,
        });
      }
    } catch (error) {
      console.error("プロフィールの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>ログインが必要です</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <p className="text-center">読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">プロフィール</CardTitle>
          <Button onClick={() => router.push("/profile/edit")}>
            編集
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">お名前</h3>
                <p className="text-lg">{profile?.name || "未設定"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h3>
                <p className="text-lg">{profile?.email}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">電話番号</h3>
              <p className="text-lg">{profile?.phone || "未設定"}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">配送先住所</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">郵便番号</h4>
                    <p className="text-lg">{profile?.zipCode || "未設定"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">都道府県</h4>
                    <p className="text-lg">{profile?.prefecture || "未設定"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">市区町村</h4>
                  <p className="text-lg">{profile?.city || "未設定"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">住所1</h4>
                  <p className="text-lg">{profile?.addressLine1 || "未設定"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">住所2（建物名など）</h4>
                  <p className="text-lg">{profile?.addressLine2 || "未設定"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}