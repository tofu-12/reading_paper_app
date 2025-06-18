import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Upload, FileText, Loader, Check, AlertCircle } from 'lucide-react';
import { paperApi } from '../services/api';

const UploadContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const DropzoneContainer = styled.div`
  border: 2px dashed ${props => 
    props.isDragActive ? '#667eea' : 
    props.isUploaded ? '#28a745' : '#ddd'
  };
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  background-color: ${props => 
    props.isDragActive ? '#f8f9ff' : 
    props.isUploaded ? '#f8fff8' : 'white'
  };
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 2rem;
  
  &:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
  }
`;

const DropzoneIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: ${props => 
      props.isUploaded ? '#28a745' : 
      props.isDragActive ? '#667eea' : '#999'
    };
  }
`;

const DropzoneText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const DropzoneSubtext = styled.p`
  font-size: 0.9rem;
  color: #999;
`;

const UploadedFileInfo = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
  
  svg {
    margin-right: 0.5rem;
    color: #667eea;
  }
`;

const FileSize = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ProcessingStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const StatusIcon = styled.div`
  margin-right: 1rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => 
      props.status === 'processing' ? '#667eea' :
      props.status === 'success' ? '#28a745' :
      props.status === 'error' ? '#dc3545' : '#999'
    };
    
    ${props => props.status === 'processing' && `
      animation: spin 1s linear infinite;
    `}
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatusText = styled.div`
  font-size: 1.1rem;
  color: #333;
`;

const SummaryContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const SummaryTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SummarySection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #667eea;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const SectionContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
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

const UploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summary, setSummary] = useState(null);

  const uploadMutation = useMutation(paperApi.uploadAndSummarizePaper, {
    onSuccess: (data) => {
      setSummary(data);
      toast.success('論文の要約が完了しました！');
    },
    onError: (error) => {
      toast.error(`エラーが発生しました: ${error.response?.data?.detail || error.message}`);
    },
  });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setSummary(null);
      uploadMutation.mutate(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploadMutation.isLoading,
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusInfo = () => {
    if (uploadMutation.isLoading) {
      return { status: 'processing', text: 'AIが論文を解析・要約中です...', icon: Loader };
    } else if (uploadMutation.isSuccess) {
      return { status: 'success', text: '要約が完了しました！', icon: Check };
    } else if (uploadMutation.isError) {
      return { status: 'error', text: 'エラーが発生しました', icon: AlertCircle };
    }
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <UploadContainer>
      <Title>論文PDFアップロード</Title>
      
      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        isUploaded={!!uploadedFile}
      >
        <input {...getInputProps()} />
        <DropzoneIcon isDragActive={isDragActive} isUploaded={!!uploadedFile}>
          {uploadedFile ? <Check /> : <Upload />}
        </DropzoneIcon>
        <DropzoneText>
          {isDragActive ? 
            'PDFファイルをここにドロップしてください' :
            uploadedFile ? 
            'ファイルがアップロードされました' :
            'PDFファイルをドラッグ&ドロップまたはクリックしてアップロード'
          }
        </DropzoneText>
        <DropzoneSubtext>PDF形式のファイルのみ対応しています</DropzoneSubtext>
      </DropzoneContainer>

      {uploadedFile && (
        <UploadedFileInfo>
          <FileName>
            <FileText />
            {uploadedFile.name}
          </FileName>
          <FileSize>{formatFileSize(uploadedFile.size)}</FileSize>
        </UploadedFileInfo>
      )}

      {statusInfo && (
        <ProcessingStatus>
          <StatusIcon status={statusInfo.status}>
            <statusInfo.icon />
          </StatusIcon>
          <StatusText>{statusInfo.text}</StatusText>
        </ProcessingStatus>
      )}

      {summary && (
        <SummaryContainer>
          <SummaryTitle>論文要約結果</SummaryTitle>
          
          <SummarySection>
            <SectionTitle>タイトル</SectionTitle>
            <SectionContent>{summary.title}</SectionContent>
          </SummarySection>

          {summary.authors && (
            <SummarySection>
              <SectionTitle>著者</SectionTitle>
              <SectionContent>{summary.authors}</SectionContent>
            </SummarySection>
          )}

          {summary.abstract && (
            <SummarySection>
              <SectionTitle>アブストラクト</SectionTitle>
              <SectionContent>{summary.abstract}</SectionContent>
            </SummarySection>
          )}

          {summary.summary_introduction && (
            <SummarySection>
              <SectionTitle>研究背景・目的</SectionTitle>
              <SectionContent>{summary.summary_introduction}</SectionContent>
            </SummarySection>
          )}

          {summary.summary_methods && (
            <SummarySection>
              <SectionTitle>研究手法</SectionTitle>
              <SectionContent>{summary.summary_methods}</SectionContent>
            </SummarySection>
          )}

          {summary.summary_results && (
            <SummarySection>
              <SectionTitle>結果</SectionTitle>
              <SectionContent>{summary.summary_results}</SectionContent>
            </SummarySection>
          )}

          {summary.summary_discussion && (
            <SummarySection>
              <SectionTitle>考察</SectionTitle>
              <SectionContent>{summary.summary_discussion}</SectionContent>
            </SummarySection>
          )}

          {summary.summary_conclusion && (
            <SummarySection>
              <SectionTitle>結論</SectionTitle>
              <SectionContent>{summary.summary_conclusion}</SectionContent>
            </SummarySection>
          )}

          {summary.keywords && summary.keywords.length > 0 && (
            <SummarySection>
              <SectionTitle>キーワード</SectionTitle>
              <Keywords>
                {summary.keywords.map((keyword, index) => (
                  <Keyword key={index}>{keyword}</Keyword>
                ))}
              </Keywords>
            </SummarySection>
          )}
        </SummaryContainer>
      )}
    </UploadContainer>
  );
};

export default UploadPage;