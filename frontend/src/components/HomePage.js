import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Upload, Search, List, FileText, Brain, MessageSquare } from 'lucide-react';

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const WelcomeSection = styled.section`
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesSection = styled.section`
  margin-bottom: 3rem;
`;

const FeaturesTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: #667eea;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const ActionsSection = styled.section`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  svg {
    margin-right: 0.5rem;
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const HomePage = () => {
  return (
    <HomeContainer>
      <WelcomeSection>
        <Title>論文要約・検索システム</Title>
        <Subtitle>
          Gemini APIを活用して、論文のPDFファイルを自動要約し、
          効率的な検索・質問応答を可能にするWebアプリケーションです。
        </Subtitle>
      </WelcomeSection>

      <FeaturesSection>
        <FeaturesTitle>主な機能</FeaturesTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <Brain />
            </FeatureIcon>
            <FeatureTitle>AI論文要約</FeatureTitle>
            <FeatureDescription>
              Gemini APIを使用して、アップロードされた論文PDFを
              研究背景・手法・結果・考察・結論の各項目に分けて要約します。
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Search />
            </FeatureIcon>
            <FeatureTitle>高度な検索機能</FeatureTitle>
            <FeatureDescription>
              キーワード、タイトル、著者名、全文検索など
              多様な検索方法で過去にアップロードした論文を素早く見つけられます。
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <MessageSquare />
            </FeatureIcon>
            <FeatureTitle>論文質問機能</FeatureTitle>
            <FeatureDescription>
              アップロードした論文に対して自然言語で質問でき、
              AIが論文の内容に基づいて詳細な回答を提供します。
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <ActionsSection>
        <ActionButton to="/upload">
          <Upload />
          論文をアップロード
        </ActionButton>
        
        <ActionButton to="/search">
          <Search />
          論文を検索
        </ActionButton>
        
        <ActionButton to="/papers">
          <List />
          論文一覧を見る
        </ActionButton>
      </ActionsSection>
    </HomeContainer>
  );
};

export default HomePage;