import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FileText, User, Calendar, Hash, ExternalLink, Loader } from 'lucide-react';
import { paperApi } from '../services/api';

const PaperListContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
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

const PaperGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PaperCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const PaperTitle = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.4;
  
  svg {
    margin-right: 0.5rem;
    color: #667eea;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  &:hover {
    color: #667eea;
  }
`;

const PaperMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const PaperAbstract = styled.p`
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Keyword = styled.span`
  background: #f0f0f0;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
`;

const ViewDetailsLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #667eea;
  font-size: 0.9rem;
  padding: 0.5rem;
  border: 1px solid #667eea;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  svg {
    margin-left: 0.5rem;
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyStateLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PaperList = () => {
  const { 
    data: papers, 
    isLoading, 
    error 
  } = useQuery(
    'papers', 
    () => paperApi.getAllPapers(50, 0),
    {
      staleTime: 5 * 60 * 1000, // 5分間キャッシュ
      cacheTime: 10 * 60 * 1000, // 10分間保持
    }
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <PaperListContainer>
        <Title>論文一覧</Title>
        <LoadingContainer>
          <Loader />
        </LoadingContainer>
      </PaperListContainer>
    );
  }

  if (error) {
    return (
      <PaperListContainer>
        <Title>論文一覧</Title>
        <ErrorContainer>
          エラーが発生しました: {error.message}
        </ErrorContainer>
      </PaperListContainer>
    );
  }

  if (!papers || papers.length === 0) {
    return (
      <PaperListContainer>
        <Title>論文一覧</Title>
        <EmptyState>
          まだ論文がアップロードされていません。<br />
          <EmptyStateLink to="/upload">最初の論文をアップロード</EmptyStateLink>してみましょう。
        </EmptyState>
      </PaperListContainer>
    );
  }

  return (
    <PaperListContainer>
      <Title>論文一覧 ({papers.length}件)</Title>
      
      <PaperGrid>
        {papers.map((paper) => (
          <PaperCard key={paper.paper_id}>
            <PaperTitle to={`/papers/${paper.paper_id}`}>
              <FileText />
              {paper.title}
            </PaperTitle>
            
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
              <PaperAbstract>{paper.abstract}</PaperAbstract>
            )}

            {paper.keywords && paper.keywords.length > 0 && (
              <Keywords>
                {paper.keywords.slice(0, 5).map((keyword, index) => (
                  <Keyword key={index}>{keyword}</Keyword>
                ))}
                {paper.keywords.length > 5 && (
                  <Keyword>+{paper.keywords.length - 5}個</Keyword>
                )}
              </Keywords>
            )}

            <ViewDetailsLink to={`/papers/${paper.paper_id}`}>
              詳細を見る
              <ExternalLink />
            </ViewDetailsLink>
          </PaperCard>
        ))}
      </PaperGrid>
    </PaperListContainer>
  );
};

export default PaperList;