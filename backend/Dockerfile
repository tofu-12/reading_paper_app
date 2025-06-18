FROM python:3.11-slim

WORKDIR /app

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libmagic1 \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# uvのインストール
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Pythonの依存関係をコピーしてインストール
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# アップロードディレクトリを作成
RUN mkdir -p uploads

# ポート8000を公開
EXPOSE 8000

# アプリケーション起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]