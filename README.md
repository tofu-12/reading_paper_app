# 論文要約・検索システム

Gemini APIを使用して論文のPDFファイルを自動要約し、効率的な検索・質問応答を可能にするWebアプリケーションです。

## 機能

- **AI論文要約**: Gemini APIを使用して論文を研究背景・手法・結果・考察・結論の各項目に分けて要約
- **高度な検索機能**: キーワード、タイトル、著者名、全文検索など多様な検索方法
- **論文質問機能**: アップロードした論文に対して自然言語で質問し、AIが詳細な回答を提供

## 技術スタック

- **フロントエンド**: React.js 18.2.0, Styled Components, React Query
- **バックエンド**: Python 3.11, FastAPI 0.104.1, SQLAlchemy 2.0.23
- **データベース**: PostgreSQL 15
- **AI**: Google Gemini 2.0-Flash API
- **パッケージ管理**: uv (Python), npm (Node.js)
- **インフラ**: Docker, Docker Compose 3.8

## セットアップ

### 前提条件

- Docker及びDocker Composeがインストールされていること
- Gemini APIキー（Google AI Studio経由）

#### ローカル開発環境（オプション）
- Python 3.11以上 + uv パッケージマネージャー
- Node.js 18以上 + npm

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd reading_paper_with_llm_sql
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# Gemini API設定
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. アプリケーションの起動

```bash
docker-compose up --build
```

### 4. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API文書: http://localhost:8000/docs

## 使用方法

### 1. 論文のアップロード

1. 「アップロード」ページにアクセス
2. PDFファイルをドラッグ&ドロップまたはクリックしてアップロード
3. AIが自動的に論文を解析・要約

### 2. 論文の検索

1. 「検索」ページにアクセス
2. 検索タイプを選択（キーワード、タイトル、著者、全文）
3. 検索キーワードを入力して検索実行

### 3. 論文への質問

1. 論文一覧または検索結果から論文を選択
2. 論文詳細ページの質問フォームに質問を入力
3. AIが論文の内容に基づいて回答を生成

## 開発

### バックエンド開発

```bash
cd backend
uv venv  # Python 3.11以上必須
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uvicorn main:app --reload
```

### フロントエンド開発

```bash
cd frontend
npm install  # Node.js 18以上推奨
npm start
```

### データベース

PostgreSQLを使用。スキーマは`database/schema.sql`に定義されています。

## API仕様

- `POST /upload-paper`: PDF論文のアップロード・要約
- `POST /search-papers`: 論文検索
- `POST /ask-question`: 論文への質問
- `GET /papers`: 全論文の取得
- `GET /papers/{paper_id}`: 特定論文の取得

詳細なAPI仕様は http://localhost:8000/docs で確認できます。

## プロジェクト構造

```
.
├── backend/              # Pythonバックエンド
│   ├── main.py          # FastAPIメインアプリケーション
│   ├── models/          # データモデル定義
│   ├── services/        # ビジネスロジック
│   └── database/        # データベース接続
├── frontend/            # Reactフロントエンド
│   ├── src/
│   │   ├── components/  # Reactコンポーネント
│   │   ├── services/    # API呼び出し
│   │   └── types/       # 型定義
├── database/            # データベーススキーマ
├── docker-compose.yml   # Docker構成
└── README.md
```

## ライセンス

MIT License