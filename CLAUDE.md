# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは **SEO Cluster Pro** という、トピッククラスター理論に基づくSEO記事作成支援ツールです。Next.js 15、React 19、TypeScript、Tailwind CSS、shadcn/uiを使用したモダンなWebアプリケーションです。

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# Linting実行
pnpm lint
```

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: React 19 + shadcn/ui (New York style)
- **スタイリング**: Tailwind CSS v4
- **フォーム**: React Hook Form + Zod
- **アイコン**: Lucide React
- **チャート**: Recharts
- **テーマ**: next-themes

## アーキテクチャ

### フォルダ構成

```
app/                    # Next.js App Router pages
├── dashboard/         # ダッシュボードページ
├── articles/          # 記事管理ページ
├── clusters/          # トピッククラスターページ
├── layout.tsx         # ルートレイアウト
└── page.tsx           # ログインページ

components/            # React components
├── ui/               # shadcn/ui base components
├── dashboard-layout.tsx  # ダッシュボードレイアウト
├── sidebar.tsx       # サイドバーコンポーネント
├── site-selector.tsx # サイト選択コンポーネント
└── [各種業務コンポーネント]

lib/                  # ユーティリティ
└── utils.ts         # Tailwind CSS用ユーティリティ

hooks/               # カスタムフック
```

### 主要コンポーネント

- **DashboardLayout**: サイドバー付きのメインレイアウト
- **Sidebar**: ナビゲーション用サイドバー
- **SiteSelector**: サイト選択機能
- **ArticleList**: 記事一覧表示
- **TopicClusterTree**: トピッククラスター階層表示
- **ClusterActions**: クラスター操作機能

### パス設定

```typescript
"@/*": ["./*"]  // ルートディレクトリからのエイリアス
```

shadcn/uiエイリアス:
- `@/components` - components/
- `@/lib` - lib/
- `@/hooks` - hooks/
- `@/components/ui` - components/ui/

## 重要な設定

- **言語**: 日本語 (lang="ja")
- **フォント**: Inter + Playfair Display
- **Tailwind**: CSS Variables使用、New Yorkスタイル
- **Next.js**: ESLint/TypeScriptエラーをビルド時に無視
- **画像**: 最適化無効

## 開発時の注意点

- shadcn/uiコンポーネントを最大限活用する
- フォームにはReact Hook Form + Zodを使用
- 日本語UIテキストを使用
- 既存のコンポーネント構造に従って新機能を実装
- TypeScriptの型定義を適切に行う

## 実装済み機能

### 認証システム
- Supabase Auth使用
- メール/パスワード認証
- 認証ガード（AuthGuard）
- 認証コンテキスト（AuthContext）

### サイト管理
- サイト登録・編集・削除
- サイト選択機能
- ユーザーごとのサイト管理

### URL収集・分析
- サイトクローリング（サイトマップ/robots.txt解析）
- HTML解析とコンテンツ抽出
- Supabaseへの保存

### AI分析機能
- Gemini 2.0 Flash使用
- サイト内容の自動分析
- トピッククラスター理論に基づく戦略提案
- SEO改善提案

### トピッククラスター管理
- ツリー構造での表示
- AI提案の可視化
- 選択・保存機能

### 記事生成・管理
- AI記事生成（2万文字以上）
- Markdown形式での出力
- 記事プレビュー
- ステータス管理（下書き/公開）
- ダウンロード機能

## データベース構造

主要テーブル:
- `users` - ユーザー情報
- `sites` - サイト情報  
- `site_urls` - クロールしたURL
- `topic_clusters` - トピッククラスター
- `articles` - 生成記事

## 環境変数

`.env.local`に設定が必要:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_AI_API_KEY=
```