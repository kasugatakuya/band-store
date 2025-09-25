# Band Store

バンドのアルバムとTシャツを販売するECサイト

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **認証**: NextAuth.js + Supabase Provider
- **決済**: Stripe
- **フォーム**: React Hook Form + Zod
- **デプロイ**: Vercel

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Database
DATABASE_URL=your_database_url_here
```

3. データベースのマイグレーション
```bash
npx prisma generate
npx prisma migrate dev
```

4. 開発サーバーの起動
```bash
npm run dev
```

## 機能

- 🎵 商品（アルバム・Tシャツ）の閲覧・検索
- 🛒 カート機能
- 💳 Stripe決済
- 👤 ユーザー認証（Supabase）
- 📦 注文管理
- 🔐 管理画面（商品管理・注文管理）

## プロジェクト構造

```
band-store/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # 管理画面
│   ├── auth/              # 認証ページ
│   ├── cart/              # カートページ
│   ├── products/          # 商品ページ
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ
├── prisma/               # Prismaスキーマ
├── types/                # TypeScript型定義
└── public/               # 静的ファイル
```

## 管理者アカウント

管理画面にアクセスするには、Supabaseデータベースで対象ユーザーのroleをADMINに変更してください。

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```
