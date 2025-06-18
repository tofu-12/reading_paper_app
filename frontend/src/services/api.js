import axios from 'axios';
import { API_BASE_URL } from '../types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5分（PDF処理に時間がかかる可能性があるため）
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API関数群
export const paperApi = {
  // PDFアップロード・要約
  uploadAndSummarizePaper: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload-paper', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 論文検索
  searchPapers: async (searchRequest) => {
    const response = await apiClient.post('/search-papers', searchRequest);
    return response.data;
  },

  // PDFに質問
  askQuestion: async (questionRequest) => {
    const response = await apiClient.post('/ask-question', questionRequest);
    return response.data;
  },

  // 全ての論文を取得
  getAllPapers: async (limit = 20, offset = 0) => {
    const response = await apiClient.get('/papers', {
      params: { limit, offset }
    });
    return response.data;
  },

  // 特定の論文を取得
  getPaperById: async (paperId) => {
    const response = await apiClient.get(`/papers/${paperId}`);
    return response.data;
  },

  // ヘルスチェック
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;