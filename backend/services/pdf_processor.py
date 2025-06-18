import hashlib
from typing import Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.database_models import Paper


class PDFProcessor:
    """PDF処理サービス"""


    async def save_paper_to_database(
        self,
        file: UploadFile,
        summary_data: Dict[str, Any],
        db: Session
    ) -> Paper:
        """論文データをデータベースに保存"""
        try:
            # ファイル内容を読み込み（ハッシュ計算用のみ）
            content = await file.read()
            
            # ファイルハッシュを計算
            file_hash = hashlib.sha256(content).hexdigest()
            
            # 既存の論文をチェック
            existing_paper = db.query(Paper).filter(Paper.file_hash == file_hash).first()
            if existing_paper:
                raise Exception("この論文は既にアップロードされています")
            
            # データベースに保存
            paper = Paper(
                original_filename=file.filename,
                title=summary_data.get('title', 'タイトル不明'),
                authors=summary_data.get('authors'),
                abstract=summary_data.get('abstract'),
                summary_introduction=summary_data.get('summary_introduction'),
                summary_methods=summary_data.get('summary_methods'),
                summary_results=summary_data.get('summary_results'),
                summary_discussion=summary_data.get('summary_discussion'),
                summary_conclusion=summary_data.get('summary_conclusion'),
                keywords=summary_data.get('keywords', []),
                file_size=len(content),
                file_hash=file_hash
            )
            
            db.add(paper)
            db.commit()
            db.refresh(paper)
            
            return paper
            
        except Exception as e:
            db.rollback()
            raise Exception(f"論文保存エラー: {str(e)}")

    def _calculate_file_hash(self, content: bytes) -> str:
        """ファイルハッシュを計算"""
        return hashlib.sha256(content).hexdigest()

