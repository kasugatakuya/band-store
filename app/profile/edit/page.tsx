"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

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

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
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
        // リダイレクト処理
        if (redirect === "checkout") {
          router.push("/cart");
        } else {
          router.push("/profile");
        }
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "不明なエラー" }));
        console.error("更新エラー:", errorData);
        alert(
          `更新に失敗しました: ${
            errorData.error || errorData.details || "不明なエラー"
          }`
        );
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">プロフィール編集</h1>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center">読み込み中...</p>
            </CardContent>
          </Card>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* 配送先住所 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">配送先住所</CardTitle>
                {redirect === "checkout" && (
                  <p className="text-sm text-gray-600">
                    お会計を進めるには配送先住所の登録が必要です。
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">郵便番号 *</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={profile.zipCode || ""}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      placeholder="123-4567"
                      required={redirect === "checkout"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefecture">都道府県 *</Label>
                    <Select
                      value={profile.prefecture || ""}
                      onValueChange={(value) =>
                        handleChange("prefecture", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="都道府県を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {prefectures.map((pref) => (
                          <SelectItem key={pref} value={pref}>
                            {pref}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">市区町村 *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={profile.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="渋谷区"
                    required={redirect === "checkout"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">住所1（番地まで） *</Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={profile.addressLine1 || ""}
                    onChange={(e) =>
                      handleChange("addressLine1", e.target.value)
                    }
                    placeholder="道玄坂1-2-3"
                    required={redirect === "checkout"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">
                    住所2（建物名・部屋番号）
                  </Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={profile.addressLine2 || ""}
                    onChange={(e) =>
                      handleChange("addressLine2", e.target.value)
                    }
                    placeholder="〇〇ビル 4F"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ボタン（2カラムにまたがる） */}
            <div className="lg:col-span-2 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "更新中..." : "プロフィールを更新"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
