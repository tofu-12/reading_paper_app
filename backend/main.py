from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

from database.connection import get_database_session
from services.pdf_processor import PDFProcessor
from services.gemini_service import GeminiService
from services.search_service import SearchService
from models.database_models import Paper, SearchHistory, QAHistory
from models.api_models import (
    PaperSummaryResponse,
    SearchRequest,
    SearchResponse,
    QuestionRequest,
    QuestionResponse
)

load_dotenv()

app = FastAPI(
    title="論文要約・検索API",
    description="Gemini APIを使用した論文要約・検索システム",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# サービスインスタンス
pdf_processor = PDFProcessor()
gemini_service = GeminiService()
search_service = SearchService()


@app.get("/")
async def root():
    return {"message": "論文要約・検索API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/upload-paper", response_model=PaperSummaryResponse)
async def upload_and_summarize_paper(
    file: UploadFile = File(...),
    db: Session = Depends(get_database_session)
):
    """PDFファイルをアップロードして要約を生成"""
    try:
        # ファイル検証
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="PDFファイルのみ対応しています")
        
        # Gemini APIで要約生成
        summary_data = await gemini_service.generate_paper_summary(file)
        
        # データベースに保存
        paper = await pdf_processor.save_paper_to_database(
            file, summary_data, db
        )
        
        return PaperSummaryResponse(
            paper_id=paper.paper_id,
            title=paper.title,
            authors=paper.authors,
            abstract=paper.abstract,
            summary_introduction=paper.summary_introduction,
            summary_methods=paper.summary_methods,
            summary_results=paper.summary_results,
            summary_discussion=paper.summary_discussion,
            summary_conclusion=paper.summary_conclusion,
            keywords=paper.keywords
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ファイル処理エラー: {str(e)}")


@app.post("/search-papers", response_model=SearchResponse)
async def search_papers(
    request: SearchRequest,
    db: Session = Depends(get_database_session)
):
    """論文検索"""
    try:
        results = await search_service.search_papers(
            query=request.query,
            search_type=request.search_type,
            limit=request.limit,
            db=db
        )
        
        return SearchResponse(
            query=request.query,
            results=results,
            total_count=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"検索エラー: {str(e)}")


@app.post("/ask-question", response_model=QuestionResponse)
async def ask_question_about_paper(
    request: QuestionRequest,
    db: Session = Depends(get_database_session)
):
    """PDFに対する質問"""
    try:
        # 論文データを取得
        paper = db.query(Paper).filter(Paper.paper_id == request.paper_id).first()
        if not paper:
            raise HTTPException(status_code=404, detail="論文が見つかりません")
        
        # Gemini APIで質問に回答
        answer = await gemini_service.answer_question_about_paper(
            paper, request.question
        )
        
        # QA履歴を保存
        qa_record = QAHistory(
            paper_id=request.paper_id,
            question=request.question,
            answer=answer,
            user_session=request.user_session
        )
        db.add(qa_record)
        db.commit()
        
        return QuestionResponse(
            question=request.question,
            answer=answer,
            paper_id=request.paper_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"質問処理エラー: {str(e)}")


@app.get("/papers", response_model=List[PaperSummaryResponse])
async def get_all_papers(
    limit: Optional[int] = 20,
    offset: Optional[int] = 0,
    db: Session = Depends(get_database_session)
):
    """すべての論文を取得"""
    papers = db.query(Paper).offset(offset).limit(limit).all()
    
    return [
        PaperSummaryResponse(
            paper_id=paper.paper_id,
            title=paper.title,
            authors=paper.authors,
            abstract=paper.abstract,
            summary_introduction=paper.summary_introduction,
            summary_methods=paper.summary_methods,
            summary_results=paper.summary_results,
            summary_discussion=paper.summary_discussion,
            summary_conclusion=paper.summary_conclusion,
            keywords=paper.keywords
        )
        for paper in papers
    ]


@app.get("/papers/{paper_id}", response_model=PaperSummaryResponse)
async def get_paper_by_id(
    paper_id: int,
    db: Session = Depends(get_database_session)
):
    """特定の論文を取得"""
    paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
    
    if not paper:
        raise HTTPException(status_code=404, detail="論文が見つかりません")
    
    return PaperSummaryResponse(
        paper_id=paper.paper_id,
        title=paper.title,
        authors=paper.authors,
        abstract=paper.abstract,
        summary_introduction=paper.summary_introduction,
        summary_methods=paper.summary_methods,
        summary_results=paper.summary_results,
        summary_discussion=paper.summary_discussion,
        summary_conclusion=paper.summary_conclusion,
        keywords=paper.keywords
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)