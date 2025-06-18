from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PaperSummaryResponse(BaseModel):
    """論文要約レスポンス"""
    paper_id: int
    title: str
    authors: Optional[str] = None
    abstract: Optional[str] = None
    summary_introduction: Optional[str] = None
    summary_methods: Optional[str] = None
    summary_results: Optional[str] = None
    summary_discussion: Optional[str] = None
    summary_conclusion: Optional[str] = None
    keywords: Optional[List[str]] = None

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    """検索リクエスト"""
    query: str
    search_type: str = "keyword"  # keyword, title, author, full_text
    limit: int = 20


class SearchResultItem(BaseModel):
    """検索結果アイテム"""
    paper_id: int
    title: str
    authors: Optional[str] = None
    abstract: Optional[str] = None
    keywords: Optional[List[str]] = None
    relevance_score: float = 0.0
    upload_date: datetime

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """検索レスポンス"""
    query: str
    results: List[SearchResultItem]
    total_count: int


class QuestionRequest(BaseModel):
    """質問リクエスト"""
    paper_id: int
    question: str
    user_session: Optional[str] = None


class QuestionResponse(BaseModel):
    """質問レスポンス"""
    question: str
    answer: str
    paper_id: int


class HealthCheckResponse(BaseModel):
    """ヘルスチェックレスポンス"""
    status: str
    timestamp: datetime = datetime.now()