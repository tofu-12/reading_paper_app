import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Search, FileText, User, Hash, Globe, Calendar, ExternalLink } from 'lucide-react';
import { paperApi } from '../services/api';
import { SEARCH_TYPES } from '../types/api';

const SearchContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const SearchForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchTypeSelect = styled.select`
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  min-width: 150px;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 120px;
  
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

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResultsCount = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const ResultTitle = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  
  svg {
    margin-right: 0.5rem;
    color: #667eea;
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    color: #667eea;
  }
`;

const ResultMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.25rem;
    width: 14px;
    height: 14px;
  }
`;

const ResultAbstract = styled.p`
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Keyword = styled.span`
  background: #f0f0f0;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const searchTypeOptions = [
  { value: SEARCH_TYPES.KEYWORD, label: 'キーワード検索', icon: Hash },
  { value: SEARCH_TYPES.TITLE, label: 'タイトル検索', icon: FileText },
  { value: SEARCH_TYPES.AUTHOR, label: '著者検索', icon: User },
  { value: SEARCH_TYPES.FULL_TEXT, label: '全文検索', icon: Globe },
];

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState(null);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      query: '',
      search_type: SEARCH_TYPES.KEYWORD,
      limit: 20
    }
  });

  const searchMutation = useMutation(paperApi.searchPapers, {
    onSuccess: (data) => {
      setSearchResults(data);
      if (data.total_count === 0) {
        toast.info('検索結果が見つかりませんでした');
      } else {
        toast.success(`${data.total_count}件の論文が見つかりました`);
      }
    },
    onError: (error) => {
      toast.error(`検索エラー: ${error.response?.data?.detail || error.message}`);
    },
  });

  const onSubmit = (data) => {
    if (!data.query.trim()) {
      toast.warning('検索キーワードを入力してください');
      return;
    }
    searchMutation.mutate(data);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <SearchContainer>
      <Title>論文検索</Title>
      
      <SearchForm onSubmit={handleSubmit(onSubmit)}>
        <FormRow>
          <SearchInputContainer>
            <SearchIcon>
              <Search />
            </SearchIcon>
            <SearchInput
              {...register('query')}
              placeholder="検索キーワードを入力してください"
              disabled={searchMutation.isLoading}
            />
          </SearchInputContainer>
          
          <SearchTypeSelect
            {...register('search_type')}
            disabled={searchMutation.isLoading}
          >
            {searchTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SearchTypeSelect>
          
          <SearchButton 
            type="submit" 
            disabled={searchMutation.isLoading}
          >
            <Search />
            {searchMutation.isLoading ? '検索中...' : '検索'}
          </SearchButton>
        </FormRow>
      </SearchForm>

      {searchResults && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsCount>
              「{searchResults.query}」の検索結果: {searchResults.total_count}件
            </ResultsCount>
          </ResultsHeader>

          {searchResults.results.length > 0 ? (
            <ResultsList>
              {searchResults.results.map((result) => (
                <ResultCard key={result.paper_id}>
                  <ResultTitle to={`/papers/${result.paper_id}`}>
                    <FileText />
                    {result.title}
                    <ExternalLink style={{ marginLeft: 'auto', width: '16px', height: '16px' }} />
                  </ResultTitle>
                  
                  <ResultMeta>
                    {result.authors && (
                      <MetaItem>
                        <User />
                        {result.authors}
                      </MetaItem>
                    )}
                    <MetaItem>
                      <Calendar />
                      {formatDate(result.upload_date)}
                    </MetaItem>
                  </ResultMeta>

                  {result.abstract && (
                    <ResultAbstract>{result.abstract}</ResultAbstract>
                  )}

                  {result.keywords && result.keywords.length > 0 && (
                    <Keywords>
                      {result.keywords.map((keyword, index) => (
                        <Keyword key={index}>{keyword}</Keyword>
                      ))}
                    </Keywords>
                  )}
                </ResultCard>
              ))}
            </ResultsList>
          ) : (
            <NoResults>
              検索条件に一致する論文が見つかりませんでした。<br />
              別のキーワードや検索タイプを試してみてください。
            </NoResults>
          )}
        </ResultsContainer>
      )}
    </SearchContainer>
  );
};

export default SearchPage;