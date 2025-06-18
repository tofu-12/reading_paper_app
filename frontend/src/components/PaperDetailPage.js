import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FileText, 
  User, 
  Calendar, 
  MessageSquare, 
  Send, 
  Loader,
  ArrowLeft,
  Hash 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { paperApi } from '../services/api';

const DetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #667eea;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const PaperContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const PaperTitle = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const PaperMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  font-size: 0.9rem;
  color: #666;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #667eea;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
  font-size: 1.3rem;
`;

const SectionContent = styled.div`
  color: #333;
  line-height: 1.6;
  font-size: 1rem;
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Keyword = styled.span`
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.9rem;
`;

const QAContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const QATitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #667eea;
  }
`;

const QuestionForm = styled.form`
  margin-bottom: 2rem;
`;

const QuestionInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  svg {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnswerContainer = styled.div`
  background: #f8f9ff;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
`;

const QuestionText = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

const AnswerText = styled.div`
  color: #555;
  line-height: 1.6;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  
  svg {
    animation: spin 1s linear infinite;
    width: 32px;
    height: 32px;
    color: #667eea;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #dc3545;
  font-size: 1.1rem;
`;

const PaperDetailPage = () => {
  const { paperId } = useParams();
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();

  const { 
    data: paper, 
    isLoading, 
    error 
  } = useQuery(
    ['paper', paperId], 
    () => paperApi.getPaperById(parseInt(paperId)),
    {
      enabled: !!paperId,
    }
  );

  const questionMutation = useMutation(paperApi.askQuestion, {
    onSuccess: (data) => {
      setCurrentAnswer(data);
      reset();
      toast.success('質問への回答を取得しました！');
    },
    onError: (error) => {
      toast.error(`エラーが発生しました: ${error.response?.data?.detail || error.message}`);
    },
  });

  const onSubmit = (data) => {
    if (!data.question.trim()) {
      toast.warning('質問を入力してください');
      return;
    }
    
    questionMutation.mutate({
      paper_id: parseInt(paperId),
      question: data.question,
      user_session: `session_${Date.now()}`
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DetailContainer>
        <LoadingContainer>
          <Loader />
        </LoadingContainer>
      </DetailContainer>
    );
  }

  if (error) {
    return (
      <DetailContainer>
        <ErrorContainer>
          エラーが発生しました: {error.message}
        </ErrorContainer>
      </DetailContainer>
    );
  }

  if (!paper) {
    return (
      <DetailContainer>
        <ErrorContainer>
          論文が見つかりませんでした
        </ErrorContainer>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <BackButton to="/papers">
        <ArrowLeft />
        論文一覧に戻る
      </BackButton>

      <PaperContainer>
        <PaperTitle>{paper.title}</PaperTitle>
        
        <PaperMeta>
          {paper.authors && (
            <MetaItem>
              <User />
              {paper.authors}
            </MetaItem>
          )}
          <MetaItem>
            <Calendar />
            {formatDate(paper.upload_date)}
          </MetaItem>
        </PaperMeta>

        {paper.abstract && (
          <SectionContainer>
            <SectionTitle>アブストラクト</SectionTitle>
            <SectionContent>{paper.abstract}</SectionContent>
          </SectionContainer>
        )}

        {paper.summary_introduction && (
          <SectionContainer>
            <SectionTitle>研究背景・目的</SectionTitle>
            <SectionContent>{paper.summary_introduction}</SectionContent>
          </SectionContainer>
        )}

        {paper.summary_methods && (
          <SectionContainer>
            <SectionTitle>研究手法</SectionTitle>
            <SectionContent>{paper.summary_methods}</SectionContent>
          </SectionContainer>
        )}

        {paper.summary_results && (
          <SectionContainer>
            <SectionTitle>結果</SectionTitle>
            <SectionContent>{paper.summary_results}</SectionContent>
          </SectionContainer>
        )}

        {paper.summary_discussion && (
          <SectionContainer>
            <SectionTitle>考察</SectionTitle>
            <SectionContent>{paper.summary_discussion}</SectionContent>
          </SectionContainer>
        )}

        {paper.summary_conclusion && (
          <SectionContainer>
            <SectionTitle>結論</SectionTitle>
            <SectionContent>{paper.summary_conclusion}</SectionContent>
          </SectionContainer>
        )}

        {paper.keywords && paper.keywords.length > 0 && (
          <SectionContainer>
            <SectionTitle>キーワード</SectionTitle>
            <Keywords>
              {paper.keywords.map((keyword, index) => (
                <Keyword key={index}>{keyword}</Keyword>
              ))}
            </Keywords>
          </SectionContainer>
        )}
      </PaperContainer>

      <QAContainer>
        <QATitle>
          <MessageSquare />
          この論文について質問する
        </QATitle>
        
        <QuestionForm onSubmit={handleSubmit(onSubmit)}>
          <QuestionInput
            {...register('question')}
            placeholder="この論文について質問してください（例：この研究の限界は何ですか？、使用されたデータセットについて教えてください）"
            disabled={questionMutation.isLoading}
          />
          <SubmitButton 
            type="submit" 
            disabled={questionMutation.isLoading}
          >
            {questionMutation.isLoading ? <Loader /> : <Send />}
            {questionMutation.isLoading ? '回答生成中...' : '質問する'}
          </SubmitButton>
        </QuestionForm>

        {currentAnswer && (
          <AnswerContainer>
            <QuestionText>
              質問: {currentAnswer.question}
            </QuestionText>
            <AnswerText>
              {currentAnswer.answer}
            </AnswerText>
          </AnswerContainer>
        )}
      </QAContainer>
    </DetailContainer>
  );
};

export default PaperDetailPage;