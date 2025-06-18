from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, BIGINT, ARRAY, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class Paper(Base):
    """論文データテーブル"""
    __tablename__ = "papers"

    paper_id              = Column(Integer, primary_key=True, index=True)
    original_filename     = Column(String(255), nullable=False)
    title                 = Column(Text, nullable=False)
    authors               = Column(Text)
    abstract              = Column(Text)
    summary_introduction  = Column(Text)
    summary_methods       = Column(Text)
    summary_results       = Column(Text)
    summary_discussion    = Column(Text)
    summary_conclusion    = Column(Text)
    keywords              = Column(ARRAY(String))
    upload_date           = Column(TIMESTAMP, default=func.current_timestamp())
    file_size             = Column(BIGINT)
    file_hash             = Column(String(64), unique=True, nullable=False)
    created_at            = Column(TIMESTAMP, default=func.current_timestamp())
    updated_at            = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # リレーション
    search_results = relationship("SearchResult", back_populates="paper")
    qa_history = relationship("QAHistory", back_populates="paper")


class SearchHistory(Base):
    """検索履歴テーブル"""
    __tablename__ = "search_history"

    search_id     = Column(Integer, primary_key=True, index=True)
    search_query  = Column(Text, nullable=False)
    search_type   = Column(String(50), nullable=False)
    result_count  = Column(Integer, default=0)
    search_date   = Column(TIMESTAMP, default=func.current_timestamp())
    user_session  = Column(String(255))
    created_at    = Column(TIMESTAMP, default=func.current_timestamp())

    # リレーション
    search_results = relationship("SearchResult", back_populates="search_history")


class SearchResult(Base):
    """検索結果テーブル"""
    __tablename__ = "search_results"

    result_id        = Column(Integer, primary_key=True, index=True)
    search_id        = Column(Integer, ForeignKey("search_history.search_id", ondelete="CASCADE"), nullable=False)
    paper_id         = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), nullable=False)
    relevance_score  = Column(Float, default=0.0)
    created_at       = Column(TIMESTAMP, default=func.current_timestamp())

    # リレーション
    search_history = relationship("SearchHistory", back_populates="search_results")
    paper = relationship("Paper", back_populates="search_results")


class QAHistory(Base):
    """PDF質問・回答履歴テーブル"""
    __tablename__ = "qa_history"

    qa_id         = Column(Integer, primary_key=True, index=True)
    paper_id      = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), nullable=False)
    question      = Column(Text, nullable=False)
    answer        = Column(Text, nullable=False)
    question_date = Column(TIMESTAMP, default=func.current_timestamp())
    user_session  = Column(String(255))
    created_at    = Column(TIMESTAMP, default=func.current_timestamp())

    # リレーション
    paper = relationship("Paper", back_populates="qa_history")