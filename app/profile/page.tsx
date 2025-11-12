"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("プロフィールの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        alert("プロフィールが更新されました");
      } else {
        const errorData = await response.json().catch(() => ({ error: "不明なエラー" }));
        console.error("更新エラー:", errorData);
        alert(`更新に失敗しました: ${errorData.error || errorData.details || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("プロフィールの更新に失敗しました:", error);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">プロフィール設定</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>読み込み中...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profile.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="090-1234-5678"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">住所情報</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">郵便番号</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={profile.zipCode || ""}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      placeholder="123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefecture">都道府県</Label>
                    <Input
                      id="prefecture"
                      type="text"
                      value={profile.prefecture || ""}
                      onChange={(e) => handleChange("prefecture", e.target.value)}
                      placeholder="東京都"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">市区町村</Label>
                  <Input
                    id="city"
                    type="text"
                    value={profile.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="渋谷区"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">住所1</Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={profile.addressLine1 || ""}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    placeholder="丁目番地"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">住所2（建物名など）</Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={profile.addressLine2 || ""}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    placeholder="マンション名・部屋番号など"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "更新中..." : "プロフィールを更新"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}