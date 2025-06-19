import google.genai as genai
import os
from typing import Dict, Any
from dotenv import load_dotenv
from models.database_models import Paper
from fastapi import UploadFile

load_dotenv()


class GeminiService:
    """Gemini API連携サービス"""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY環境変数が設定されていません")
        
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.0-flash-exp'

    async def generate_paper_summary(self, pdf_file: UploadFile) -> Dict[str, Any]:
        """PDFファイルから各項目の要約を生成"""
        try:
            # ファイル内容を読み込み
            content = await pdf_file.read()
            await pdf_file.seek(0)  # ポインタを先頭に戻す
            
            # 一時ファイルとして保存してアップロード
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(content)
                temp_file_path = temp_file.name
            
            try:
                # PDFファイルをアップロード
                uploaded_file = self.client.files.upload(file=temp_file_path)
                
                prompt = self._create_summarization_prompt()
                
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[prompt, uploaded_file]
                )
                
                # ファイルを削除（Geminiサーバーから）
                self.client.files.delete(name=uploaded_file.name)
                
                return self._parse_summary_response(response.text)
            finally:
                # 一時ファイルを削除
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            raise Exception(f"Gemini API要約生成エラー: {str(e)}")

    async def answer_question_about_paper(self, paper: Paper, question: str) -> str:
        """論文に関する質問に回答"""
        try:
            # 要約データを使用して質問に回答
            context = self._create_paper_context(paper)
            prompt = self._create_qa_prompt(context, question)
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt]
            )
            
            return response.text.strip()
                
        except Exception as e:
            raise Exception(f"Gemini API質問回答エラー: {str(e)}")

    def _create_summarization_prompt(self) -> str:
        """要約生成用プロンプト作成"""
        return """
あなたは学術論文の専門的な要約を作成するエキスパートです。提供されたPDF論文を詳細に分析し、各項目について日本語で要約してください。

以下の形式で回答してください:

**TITLE:** [論文のタイトル]
**AUTHORS:** [著者名（複数の場合はカンマ区切り）]
**ABSTRACT:** [論文のアブストラクト（原文がある場合はそのまま、ない場合は内容から推定）]
**INTRODUCTION:** [研究背景、目的、先行研究についての要約（300文字程度）]
**METHODS:** [研究手法、実験設計、データ収集方法についての要約（300文字程度）]
**RESULTS:** [主要な結果、発見、データ分析結果についての要約（300文字程度）]
**DISCUSSION:** [結果の解釈、考察、意義についての要約（300文字程度）]
**CONCLUSION:** [結論、今後の課題、研究への貢献についての要約（200文字程度）]
**KEYWORDS:** [論文の主要キーワード（5-10個、カンマ区切り）]

各項目は必ず含めてください。該当する内容が見つからない場合は「情報が不足しています」と記載してください。
図表やグラフがある場合は、その内容も考慮して要約に反映させてください。
"""

    def _create_paper_context(self, paper: Paper) -> str:
        """論文コンテキスト作成"""
        context_parts = [
            f"タイトル: {paper.title}",
            f"著者: {paper.authors or '不明'}",
            f"アブストラクト: {paper.abstract or '不明'}",
            f"研究背景・目的: {paper.summary_introduction or '不明'}",
            f"研究手法: {paper.summary_methods or '不明'}",
            f"結果: {paper.summary_results or '不明'}",
            f"考察: {paper.summary_discussion or '不明'}",
            f"結論: {paper.summary_conclusion or '不明'}",
            f"キーワード: {', '.join(paper.keywords) if paper.keywords else '不明'}"
        ]
        return "\n\n".join(context_parts)


    def _create_qa_prompt(self, context: str, question: str) -> str:
        """質問回答用プロンプト作成"""
        return f"""
以下は学術論文の要約情報です。この論文について質問に答えてください。

論文情報:
{context}

質問: {question}

回答は以下の点に注意してください:
1. 論文の内容に基づいて正確に回答する
2. 不明な点は「この論文からは判断できません」と明記する
3. 専門用語は適切に説明を加える
4. 日本語で分かりやすく回答する
5. 根拠となる論文の部分を示す

回答:
"""

    def _parse_summary_response(self, response_text: str) -> Dict[str, Any]:
        """Geminiレスポンスをパース"""
        result = {
            'title': '',
            'authors': '',
            'abstract': '',
            'summary_introduction': '',
            'summary_methods': '',
            'summary_results': '',
            'summary_discussion': '',  
            'summary_conclusion': '',
            'keywords': []
        }

        lines = response_text.split('\n')
        current_section = None

        for line in lines:
            line = line.strip()
            if line.startswith('**TITLE:**'):
                current_section = 'title'
                result['title'] = line.replace('**TITLE:**', '').strip()
            elif line.startswith('**AUTHORS:**'):
                current_section = 'authors'
                result['authors'] = line.replace('**AUTHORS:**', '').strip()
            elif line.startswith('**ABSTRACT:**'):
                current_section = 'abstract'
                result['abstract'] = line.replace('**ABSTRACT:**', '').strip()
            elif line.startswith('**INTRODUCTION:**'):
                current_section = 'summary_introduction'
                result['summary_introduction'] = line.replace('**INTRODUCTION:**', '').strip()
            elif line.startswith('**METHODS:**'):
                current_section = 'summary_methods'
                result['summary_methods'] = line.replace('**METHODS:**', '').strip()
            elif line.startswith('**RESULTS:**'):
                current_section = 'summary_results'
                result['summary_results'] = line.replace('**RESULTS:**', '').strip()
            elif line.startswith('**DISCUSSION:**'):
                current_section = 'summary_discussion'
                result['summary_discussion'] = line.replace('**DISCUSSION:**', '').strip()
            elif line.startswith('**CONCLUSION:**'):
                current_section = 'summary_conclusion'
                result['summary_conclusion'] = line.replace('**CONCLUSION:**', '').strip()
            elif line.startswith('**KEYWORDS:**'):
                keywords_text = line.replace('**KEYWORDS:**', '').strip()
                result['keywords'] = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
                current_section = None
            elif line and current_section and not line.startswith('**'):
                # 複数行の内容を結合
                if result[current_section]:
                    result[current_section] += ' ' + line
                else:
                    result[current_section] = line

        return result