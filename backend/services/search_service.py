from sqlalchemy.orm import Session
from sqlalchemy import text, or_, and_
from typing import List, Dict, Any
from models.database_models import Paper, SearchHistory, SearchResult
from models.api_models import SearchResultItem
import uuid


class SearchService:
    """論文検索サービス"""

    async def search_papers(
        self,
        query: str,
        search_type: str = "keyword",
        limit: int = 20,
        db: Session = None
    ) -> List[SearchResultItem]:
        """論文を検索"""
        try:
            # 検索履歴を保存
            search_session = str(uuid.uuid4())
            search_history = SearchHistory(
                search_query=query,
                search_type=search_type,
                user_session=search_session
            )
            db.add(search_history)
            db.commit()
            db.refresh(search_history)
            
            # 検索タイプに応じて検索実行
            papers = []
            if search_type == "keyword":
                papers = await self._search_by_keywords(query, limit, db)
            elif search_type == "title":
                papers = await self._search_by_title(query, limit, db)
            elif search_type == "author":
                papers = await self._search_by_author(query, limit, db)
            elif search_type == "full_text":
                papers = await self._search_full_text(query, limit, db)
            else:
                papers = await self._search_by_keywords(query, limit, db)
            
            # 検索結果数を更新
            search_history.result_count = len(papers)
            db.commit()
            
            # 検索結果を保存
            for paper in papers:
                search_result = SearchResult(
                    search_id=search_history.search_id,
                    paper_id=paper.paper_id,
                    relevance_score=1.0  # 簡易的なスコア
                )
                db.add(search_result)
            db.commit()
            
            # レスポンス形式に変換
            return [
                SearchResultItem(
                    paper_id=paper.paper_id,
                    title=paper.title,
                    authors=paper.authors,
                    abstract=paper.abstract,
                    keywords=paper.keywords,
                    relevance_score=1.0,
                    upload_date=paper.upload_date
                )
                for paper in papers
            ]
            
        except Exception as e:
            db.rollback()
            raise Exception(f"論文検索エラー: {str(e)}")

    async def _search_by_keywords(self, query: str, limit: int, db: Session) -> List[Paper]:
        """キーワードで検索"""
        search_terms = [term.strip() for term in query.split() if term.strip()]
        
        conditions = []
        for term in search_terms:
            keyword_condition = text(f"'{term}' = ANY(keywords)")
            title_condition = Paper.title.ilike(f"%{term}%")
            abstract_condition = Paper.abstract.ilike(f"%{term}%")
            
            conditions.append(or_(keyword_condition, title_condition, abstract_condition))
        
        if not conditions:
            return []
        
        query_filter = and_(*conditions) if len(conditions) > 1 else conditions[0]
        
        return db.query(Paper).filter(query_filter).limit(limit).all()

    async def _search_by_title(self, query: str, limit: int, db: Session) -> List[Paper]:
        """タイトルで検索"""
        return db.query(Paper).filter(
            Paper.title.ilike(f"%{query}%")
        ).limit(limit).all()

    async def _search_by_author(self, query: str, limit: int, db: Session) -> List[Paper]:
        """著者名で検索"""
        return db.query(Paper).filter(
            Paper.authors.ilike(f"%{query}%")
        ).limit(limit).all()

    async def _search_full_text(self, query: str, limit: int, db: Session) -> List[Paper]:
        """全文検索"""
        search_terms = [term.strip() for term in query.split() if term.strip()]
        
        conditions = []
        for term in search_terms:
            conditions.append(
                or_(
                    Paper.title.ilike(f"%{term}%"),
                    Paper.authors.ilike(f"%{term}%"),
                    Paper.abstract.ilike(f"%{term}%"),
                    Paper.summary_introduction.ilike(f"%{term}%"),
                    Paper.summary_methods.ilike(f"%{term}%"),
                    Paper.summary_results.ilike(f"%{term}%"),
                    Paper.summary_discussion.ilike(f"%{term}%"),
                    Paper.summary_conclusion.ilike(f"%{term}%")
                )
            )
        
        if not conditions:
            return []
        
        query_filter = and_(*conditions) if len(conditions) > 1 else conditions[0]
        
        return db.query(Paper).filter(query_filter).limit(limit).all()

    async def get_search_history(self, user_session: str, db: Session) -> List[Dict[str, Any]]:
        """検索履歴を取得"""
        history = db.query(SearchHistory).filter(
            SearchHistory.user_session == user_session
        ).order_by(SearchHistory.search_date.desc()).limit(20).all()
        
        return [
            {
                "search_id": h.search_id,
                "query": h.search_query,
                "search_type": h.search_type,
                "result_count": h.result_count,
                "search_date": h.search_date
            }
            for h in history
        ]