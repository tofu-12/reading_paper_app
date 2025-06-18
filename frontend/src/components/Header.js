import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FileText, Search, Upload, List } from 'lucide-react';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    color: #f0f0f0;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <FileText />
          論文要約・検索システム
        </Logo>
        
        <Navigation>
          <NavLink to="/upload" className={isActive('/upload')}>
            <Upload />
            アップロード
          </NavLink>
          
          <NavLink to="/search" className={isActive('/search')}>
            <Search />
            検索
          </NavLink>
          
          <NavLink to="/papers" className={isActive('/papers')}>
            <List />
            論文一覧
          </NavLink>
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;