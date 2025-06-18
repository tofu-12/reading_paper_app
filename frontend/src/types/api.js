// API レスポンス型定義

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 論文要約レスポンス
export const PaperSummaryResponseSchema = {
  paper_id: 'number',
  title: 'string',
  authors: 'string',
  abstract: 'string',
  summary_introduction: 'string',
  summary_methods: 'string',
  summary_results: 'string',
  summary_discussion: 'string',
  summary_conclusion: 'string',
  keywords: 'array'
};

// 検索リクエスト
export const SearchRequestSchema = {
  query: 'string',
  search_type: 'string', // keyword, title, author, full_text
  limit: 'number'
};

// 検索結果アイテム
export const SearchResultItemSchema = {
  paper_id: 'number',
  title: 'string',
  authors: 'string',
  abstract: 'string',
  keywords: 'array',
  relevance_score: 'number',
  upload_date: 'string'
};

// 検索レスポンス
export const SearchResponseSchema = {
  query: 'string',
  results: 'array',
  total_count: 'number'
};

// 質問リクエスト
export const QuestionRequestSchema = {
  paper_id: 'number',
  question: 'string',
  user_session: 'string'
};

// 質問レスポンス
export const QuestionResponseSchema = {
  question: 'string',
  answer: 'string',
  paper_id: 'number'
};

// 検索タイプ定数
export const SEARCH_TYPES = {
  KEYWORD: 'keyword',
  TITLE: 'title',
  AUTHOR: 'author',
  FULL_TEXT: 'full_text'
};

// エラーレスポンス
export const ErrorResponseSchema = {
  detail: 'string'
};