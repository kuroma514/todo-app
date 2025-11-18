// src/views/SettingsView.tsx
import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { AppData, AppSettings } from '../types'; // ★ AppSettings をインポート
import { accentColors } from '../themes'; // ★ accentColors をインポート

// ★ セクションのスタイル (テーマ連動に変更)
const SettingsSection = styled.section`
  margin-bottom: 24px;
  padding: 16px;
  background-color: ${props => props.theme.panel}; // ★ テーマ連動
  border: 1px solid ${props => props.theme.border}; // ★ テーマ連動
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${props => props.theme.text}; // ★ テーマ連動
  margin-top: 0;
  margin-bottom: 12px;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.subText}; // ★ テーマ連動
  margin-bottom: 16px;
`;

// ★ ボタンのスタイル (テーマ連動に変更)
const ActionButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: ${props => props.theme.accent}; // ★ テーマ連動
  color: white; // 基本白のまま
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    opacity: 0.9;
  }
`;

// ★ インポートボタン（ファイル選択）を隠すためのラッパー
const HiddenFileInput = styled.input`
  display: none;
`;

// ★ インポートボタン（見た目）
const ImportButtonLabel = styled.label`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #666;
  }
`;

// ★ 追加: テーマ選択UIのスタイル
const SelectionGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
`;

const ColorDot = styled.span<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid ${props => props.theme.border};
`;


export const SettingsView: React.FC = () => {
  const { appData, setAppData } = useData();
  const { settings } = appData;

  // --- (エクスポート処理: 変更なし) ---
  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(appData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("エクスポートに失敗しました:", error);
      alert("データのエクスポートに失敗しました。");
    }
  };

  // --- (インポート処理: 変更なし) ---
  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(
      "本当にデータをインポートしますか？\n現在のデータはすべて上書きされます！"
    )) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedData = JSON.parse(jsonString) as AppData;
        
        if (importedData.projects && importedData.tasks && importedData.tags) {
          setAppData(importedData);
          alert("データのインポートに成功しました！");
        } else {
          throw new Error("ファイルの形式が正しくありません。");
        }
      } catch (error) {
        console.error("インポートに失敗しました:", error);
        alert("データのインポートに失敗しました。ファイルが壊れているか、形式が正しくありません。");
      } finally {
        e.target.value = "";
      }
    };
    
    reader.readAsText(file);
  };

  // ★ 追加: テーマ（Mode）変更ハンドラ
  const handleThemeModeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value as AppSettings['theme'];
    setAppData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        theme: newMode,
      },
    }));
  };

  // ★ 追加: アクセントカラー変更ハンドラ
  const handleAccentColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newColorName = e.target.value;
    setAppData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        accentColor: newColorName,
      },
    }));
  };

  return (
    <div>
      <h1>設定</h1>

      {/* ★ 追加: テーマ・外観セクション --- */}
      <SettingsSection>
        <SectionTitle>テーマ・外観</SectionTitle>
        
        <SectionDescription>テーマモード</SectionDescription>
        <SelectionGroup>
          <label>
            <input
              type="radio"
              name="theme-mode"
              value="light"
              checked={settings.theme === 'light'}
              onChange={handleThemeModeChange}
            />
            ライト
          </label>
          <label>
            <input
              type="radio"
              name="theme-mode"
              value="dark"
              checked={settings.theme === 'dark'}
              onChange={handleThemeModeChange}
            />
            ダーク
          </label>
        </SelectionGroup>
        
        <SectionDescription style={{ marginTop: '20px' }}>
          アクセントカラー
        </SectionDescription>
        <SelectionGroup>
          {Object.entries(accentColors).map(([name, color]) => (
            <label key={name}>
              <input
                type="radio"
                name="accent-color"
                value={name}
                checked={settings.accentColor === name}
                onChange={handleAccentColorChange}
              />
              <ColorDot color={color} />
            </label>
          ))}
        </SelectionGroup>
      </SettingsSection>

      {/* --- データ管理セクション --- */}
      <SettingsSection>
        <SectionTitle>データ管理</SectionTitle>
        <SectionDescription>
          現在の全データをファイルとしてバックアップ（エクスポート）したり、
          バックアップファイルからデータを復元（インポート）できます。
        </SectionDescription>
        
        <ActionButton onClick={handleExport}>
          エクスポート
        </ActionButton>
        
        <ImportButtonLabel htmlFor="import-file">
          インポート
        </ImportButtonLabel>
        <HiddenFileInput
          id="import-file"
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
        />
      </SettingsSection>
    </div>
  );
};