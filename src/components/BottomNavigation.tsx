// src/components/BottomNavigation.tsx
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom'; 

// ★ 変更点: props.theme を使用
const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.panel}; /* theme.panel を使用 */
  display: flex;
  justify-content: space-around;
  border-top: 1px solid ${props => props.theme.border}; /* ★ 変更 */
`;

// ★ 変更点: props.theme を使用
const StyledNavLink = styled(NavLink)`
  padding: 16px 12px;
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme.subText}; /* ★ 変更 (通常時の色) */
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;

  /* NavLinkが持つ「現在地」判定機能 */
  &.active {
    color: ${props => props.theme.accent}; /* ★ 変更 (アクセントカラー) */
  }
`;

export const BottomNavigation: React.FC = () => {
  return (
    <NavWrapper>
      <StyledNavLink to="/">今日</StyledNavLink>
      <StyledNavLink to="/projects">全プロジェクト</StyledNavLink>
      <StyledNavLink to="/tags">タグ管理</StyledNavLink>
      <StyledNavLink to="/settings">設定</StyledNavLink>
    </NavWrapper>
  );
};