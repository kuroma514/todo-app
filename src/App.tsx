// src/App.tsx
import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'; // ★
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { TodayView } from './views/TodayView';
import { AllProjectsView } from './views/AllProjectsView';
import { TagsView } from './views/TagsView';
import { SettingsView } from './views/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { DataProvider, useData } from './contexts/DataContext'; // ★ useData をインポート
import { TaskDetailModal } from './components/TaskDetailModal';
import { createTheme } from './themes'; // ★ createTheme をインポート

// ★ 追加: グローバルスタイル
// (props.theme から動的に色を取得する)
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.body};
    color: ${props => props.theme.text};
    /* スムーズな色変更のためのトランジション */
    transition: background-color 0.2s ease, color 0.2s ease;
  }
`;

const MainContent = styled.main`
  padding: 16px;
  padding-bottom: 80px;
`;

// ★ 追加: App.tsx の中身を AppContent に切り出し
// (useData() を ThemeProvider の子孫で使うため)
const AppContent: React.FC = () => {
  // useData から現在の設定（theme, accentColor）を取得
  const { appData } = useData();
  const { theme: themeMode, accentColor } = appData.settings;
  
  // 設定から動的にテーマオブジェクトを生成
  const activeTheme = createTheme(themeMode, accentColor);

  return (
    // ★ 追加: ThemeProvider でアプリ全体をラップ
    <ThemeProvider theme={activeTheme}>
      <GlobalStyle /> {/* ★ グローバルスタイルを適用 */}
      <div>
        <header>
          {/* ヘッダーは後で実装 */}
        </header>

        <MainContent>
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/projects" element={<AllProjectsView />} />
            <Route path="/tags" element={<TagsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </MainContent>

        <BottomNavigation />
        <TaskDetailModal />
      </div>
    </ThemeProvider>
  );
};

// ★ 変更点: Appコンポーネントは Provider を配置するだけにする
function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        {/* ★ AppContent を呼び出す */}
        <AppContent />
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;