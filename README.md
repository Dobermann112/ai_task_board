# ai_task_board

## サービス概要

タスクを管理するためのTask Boardアプリケーション。

## 現在実装済み機能

- Task CRUD API（作成・一覧取得・単一取得・更新・削除）

## 技術スタック

- Next.js (App Router) / TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite（開発用DB、`@prisma/adapter-better-sqlite3`経由で接続）

## ディレクトリ構成

```
src/
  app/
    api/
      tasks/
        route.ts          # GET /api/tasks, POST /api/tasks
        [id]/route.ts     # GET/PUT/DELETE /api/tasks/[id]
  lib/
    prisma.ts              # Prisma Clientのシングルトン
    validation.ts           # Taskリクエストのバリデーション
  generated/prisma/         # Prisma Client生成物（git管理外）
prisma/
  schema.prisma             # データモデル定義
  migrations/                # マイグレーション履歴
```

## データベース概要

`Task`モデル（`prisma/schema.prisma`）

| フィールド   | 型                          | 備考                              |
| ------------ | --------------------------- | --------------------------------- |
| id           | String                      | cuid、主キー                      |
| title        | String                      | 必須、30文字以内                  |
| description  | String?                     | 任意、100文字以内                 |
| status       | enum (TODO/IN_PROGRESS/DONE) | デフォルト TODO                   |
| priority     | enum (LOW/MEDIUM/HIGH)      | デフォルト MEDIUM                 |
| createdAt    | DateTime                    | 自動設定                          |
| updatedAt    | DateTime                    | 自動更新                          |

## 今回追加した機能

Task CRUD API を実装。

- `GET /api/tasks` — Task一覧を作成日時の降順で取得
- `POST /api/tasks` — Taskを新規作成（title必須、description/status/priorityは任意）
- `GET /api/tasks/[id]` — 指定Taskを取得
- `PUT /api/tasks/[id]` — 指定Taskを部分更新
- `DELETE /api/tasks/[id]` — 指定Taskを削除

バリデーション:

- titleは必須・30文字以内
- descriptionは任意・100文字以内
- statusは `TODO` / `IN_PROGRESS` / `DONE` のいずれか
- priorityは `LOW` / `MEDIUM` / `HIGH` のいずれか
- 不正なリクエストボディ・バリデーション違反は400
- id形式が不正な場合は400、idの形式は正しいが対象Taskが存在しない場合は404

## 起動方法

```bash
npm install
npx prisma migrate dev   # 初回のみ、DB作成・マイグレーション適用
npm run dev
```

http://localhost:3000 で起動します。

## 今後の実装予定

- Task一覧・詳細画面のUI実装
- Task作成・編集フォームのUI実装
