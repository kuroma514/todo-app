// src/components/BottomNavigation.tsx
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1E1E1E;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #333;
`;

const StyledNavLink = styled(NavLink)`
  padding: 16px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;

  &.active {
    color: #2998ff;
  }
`;

export const BottomNavigation: React.FC = () => (
  <NavWrapper>
    <StyledNavLink to="/">今日</StyledNavLink>
    <StyledNavLink to="/projects">全プロジェクト</StyledNavLink>
    <StyledNavLink to="/tags">タグ管理</StyledNavLink>
    <StyledNavLink to="/settings">設定</StyledNavLink>
  </NavWrapper>
);
// 変更点： react-router-dom から NavLink を import
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom'; 

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1E1E1E;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #333;
`;

// 変更点： NavLink をベースにスタイルを当てる
const StyledNavLink = styled(NavLink)`
  padding: 16px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #888; /* 通常時の色 */
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none; /* リンクの下線を消す */

  /* NavLinkが持つ「現在地」判定機能 */
  &.active {
    color: #2998ff; /* アクセントカラー（仮） */
  }
`;

export const BottomNavigation: React.FC = () => {
  return (
    <NavWrapper>
      {/* 変更点： ボタンを NavLink に変更し、遷移先 (to) を指定 */}
      <StyledNavLink to="/">今日</StyledNavLink>
      <StyledNavLink to="/projects">全プロジェクト</StyledNavLink>
      <StyledNavLink to="/tags">タグ管理</StyledNavLink>
      <StyledNavLink to="/settings">設定</StyledNavLink>
    </NavWrapper>
  );
};