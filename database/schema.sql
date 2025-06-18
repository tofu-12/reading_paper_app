-- 論文要約・検索システム用データベーススキーマ

-- 論文データテーブル
CREATE TABLE papers (
    paper_id              SERIAL PRIMARY KEY,
    original_filename     VARCHAR(255)     NOT NULL,
    title                 TEXT             NOT NULL,
    authors               TEXT,
    abstract              TEXT,
    summary_introduction  TEXT,
    summary_methods       TEXT,
    summary_results       TEXT,
    summary_discussion    TEXT,
    summary_conclusion    TEXT,
    keywords              TEXT[],
    upload_date           TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    file_size             BIGINT,
    file_hash             VARCHAR(64)      UNIQUE NOT NULL,
    created_at            TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- 検索履歴テーブル
CREATE TABLE search_history (
    search_id       SERIAL PRIMARY KEY,
    search_query    TEXT             NOT NULL,
    search_type     VARCHAR(50)      NOT NULL, -- 'keyword', 'title', 'author', 'full_text'
    result_count    INTEGER          DEFAULT 0,
    search_date     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    user_session    VARCHAR(255),
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- 検索結果テーブル（検索履歴と論文の関連付け）
CREATE TABLE search_results (
    result_id    SERIAL PRIMARY KEY,
    search_id    INTEGER          NOT NULL REFERENCES search_history(search_id) ON DELETE CASCADE,
    paper_id     INTEGER          NOT NULL REFERENCES papers(paper_id) ON DELETE CASCADE,
    relevance_score FLOAT         DEFAULT 0.0,
    created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- PDF質問・回答履歴テーブル
CREATE TABLE qa_history (
    qa_id          SERIAL PRIMARY KEY,
    paper_id       INTEGER          NOT NULL REFERENCES papers(paper_id) ON DELETE CASCADE,
    question       TEXT             NOT NULL,
    answer         TEXT             NOT NULL,
    question_date  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    user_session   VARCHAR(255),
    created_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_papers_keywords ON papers USING GIN(keywords);
CREATE INDEX idx_papers_title ON papers USING GIN(to_tsvector('japanese', title));
CREATE INDEX idx_papers_abstract ON papers USING GIN(to_tsvector('japanese', abstract));
CREATE INDEX idx_papers_upload_date ON papers(upload_date);
CREATE INDEX idx_papers_file_hash ON papers(file_hash);

CREATE INDEX idx_search_history_date ON search_history(search_date);
CREATE INDEX idx_search_history_query ON search_history USING GIN(to_tsvector('japanese', search_query));

CREATE INDEX idx_search_results_search_id ON search_results(search_id);
CREATE INDEX idx_search_results_paper_id ON search_results(paper_id);

CREATE INDEX idx_qa_history_paper_id ON qa_history(paper_id);
CREATE INDEX idx_qa_history_date ON qa_history(question_date);