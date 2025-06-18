import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import HomePage from './components/HomePage';
import UploadPage from './components/UploadPage';
import SearchPage from './components/SearchPage';
import PaperDetailPage from './components/PaperDetailPage';
import PaperList from './components/PaperList';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

function App() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/papers" element={<PaperList />} />
          <Route path="/papers/:paperId" element={<PaperDetailPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;