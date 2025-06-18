# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## システム概要

Gemini APIを使用した論文要約・検索Webアプリケーション。PDFをアップロードしてAI要約を生成し、検索・質問応答機能を提供する。

## アーキテクチャ

3層構成のDockerコンテナアプリケーション：
- **frontend**: React.js 18.2.0 + Node.js 18 (ポート3000) - UI/UX、ファイルアップロード、検索インターフェース
- **backend**: Python 3.11 + FastAPI 0.104.1 (ポート8000) - API、PDF処理、Gemini AI連携、データベース操作  
- **database**: PostgreSQL 15-alpine (ポート5432) - 論文データ、検索履歴、QA履歴の永続化

### 技術仕様
- **Python**: 3.11-slim (Docker基盤)
- **パッケージ管理**: uv (高速Pythonパッケージマネージャー)
- **Web フレームワーク**: FastAPI 0.104.1 + Uvicorn 0.24.0
- **ORM**: SQLAlchemy 2.0.23 + psycopg2-binary 2.9.9
- **AI API**: google-generativeai 0.3.2 (Gemini 2.0-Flash)
- **フロントエンド**: React 18.2.0 + Styled Components + React Query
- **データベース**: PostgreSQL 15 with UTF-8 encoding
- **コンテナ**: Docker Compose 3.8

### データフロー
1. フロントエンドでPDFアップロード → バックエンドでPDFファイルを直接Gemini 2.0-Flashに送信
2. Gemini APIで画像・図表も含めて要約生成（研究背景・手法・結果・考察・結論に分類）
3. PostgreSQLに構造化データとして保存（PDFファイル自体は保存しない）
4. 検索機能では4つの検索タイプ（キーワード・タイトル・著者・全文）をサポート
5. QA機能では保存された要約データを使用してGeminiが質問に回答

## 開発コマンド

### 全体起動
```bash
# 初回セットアップ
cp .env.example .env
# .envにGEMINI_API_KEYを設定

# 全サービス起動
docker-compose up --build

# 既存コンテナで起動
docker-compose up

# 停止
docker-compose down
```

### 個別開発環境

#### バックエンド開発
```bash
cd backend
uv venv  # Python 3.11+ 推奨
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**要件**: 
- Python 3.11以上
- uv パッケージマネージャー
- DockerfileではuvがインストールされてDocker内で使用されます

#### フロントエンド開発
```bash
cd frontend
npm install  # Node.js 18以上推奨
npm start    # localhost:3000で起動
```

**要件**:
- Node.js 18以上
- npm または yarn

### データベース管理
```bash
# PostgreSQLコンテナに接続
docker exec -it paper_summary_database psql -U paper_user -d paper_summary_db

# スキーマ再作成（データ削除注意）
docker-compose down -v
docker-compose up --build
```

## 重要な設定

### 環境変数
- `GEMINI_API_KEY`: Google Gemini APIキー（必須、Google AI Studio経由）
- `DATABASE_URL`: PostgreSQL接続URL（Docker環境では自動設定）

### API エンドポイント
- POST `/upload-paper`: PDF論文アップロード・要約生成
- POST `/search-papers`: 論文検索（4種類の検索タイプ）
- POST `/ask-question`: 論文への質問
- GET `/papers`: 論文一覧取得
- GET `/papers/{paper_id}`: 特定論文詳細取得
- GET `/docs`: Swagger API仕様書

## コーディング規約

### スタイル
- 縦の整列を意識（引数の`:`や`=`など）
- 関数・変数名は内容が分かる記述的な名前
- 機能単位での適切なファイル分割

### バックエンド構造
```
backend/
├── main.py              # FastAPIアプリケーション、エンドポイント定義
├── models/
│   ├── database_models.py  # SQLAlchemyモデル（Paper, SearchHistory, QAHistory）
│   └── api_models.py       # Pydanticモデル（リクエスト/レスポンス）
├── services/
│   ├── gemini_service.py   # Gemini 2.0-Flash API連携、PDF直接送信、要約・QA処理
│   ├── pdf_processor.py    # PDFファイル処理・データベース保存
│   └── search_service.py   # 検索ロジック、履歴管理
└── database/
    └── connection.py       # DB接続、セッション管理
```

### フロントエンド構造
```
frontend/src/
├── App.js              # ルーティング設定
├── components/         # ページコンポーネント
│   ├── HomePage.js        # ランディング
│   ├── UploadPage.js      # PDF アップロード・要約表示
│   ├── SearchPage.js      # 検索インターフェース
│   ├── PaperList.js       # 論文一覧
│   └── PaperDetailPage.js # 論文詳細・QA機能
├── services/
│   └── api.js          # バックエンドAPI呼び出し
└── types/
    └── api.js          # API型定義・定数
```

## データベーススキーマ

### 主要テーブル
- `papers`: 論文データ（タイトル、著者、要約各セクション、キーワード、ファイルハッシュ）
- `search_history`: 検索履歴（クエリ、検索タイプ、結果数）
- `search_results`: 検索結果の関連付け（検索-論文のマッピング）
- `qa_history`: 質問回答履歴（論文ID、質問、回答）

### 検索機能
4つの検索タイプ：
- `keyword`: キーワード配列 + タイトル・アブストラクト部分一致
- `title`: タイトル部分一致
- `author`: 著者部分一致  
- `full_text`: 全要約セクション横断検索