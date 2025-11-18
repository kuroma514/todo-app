// src/views/TagsView.tsx
import React, { useState } from 'react';
import styled from 'styled-components'; // ★
import { useData } from '../contexts/DataContext'; // ★
import { v4 as uuidv4 } from 'uuid'; // ★
import { Tag } from '../types'; // ★

// ★ フォーム用のスタイル
const AddTagForm = styled.form`
  display: flex;
  margin-bottom: 20px;
`;
const TagInput = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: white;
  margin-right: 10px;
`;
const ColorInput = styled.input`
  padding: 0;
  border: none;
  background: none;
  width: 40px;
  height: 40px; /* Inputと高さを合わせる */
  cursor: pointer;
  border-radius: 4px;
`;
const AddButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #2998ff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
`;

// ★ タグ一覧リスト用のスタイル
const TagList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const TagListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  margin-bottom: 8px;
`;
const TagColorPreview = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 12px;
  flex-shrink: 0;
`;
const TagName = styled.span`
  flex: 1;
  color: #E0E0E0;
`;
const DeleteButton = styled.button`
  padding: 6px 10px;
  font-size: 0.9rem;
  background-color: #555;
  color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #d9534f; // 赤色
    color: white;
  }
`;

export const TagsView: React.FC = () => {
  const { appData, setAppData } = useData();
  const [newTagName, setNewTagName] = useState("");
  // デフォルトの色を明るい青に
  const [newTagColor, setNewTagColor] = useState("#3498db");

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: uuidv4(),
      name: newTagName,
      color: newTagColor,
    };

    setAppData(prevData => ({
      ...prevData,
      tags: [...prevData.tags, newTag],
    }));

    setNewTagName("");
    setNewTagColor("#3498db"); // 色をデフォルトに戻す
  };

  const handleDeleteTag = (tagId: string) => {
    // 削除確認 (任意)
    // if (!window.confirm("このタグを削除しますか？")) {
    //   return;
    // }

    setAppData(prevData => ({
      ...prevData,
      // 1. タグ一覧から削除
      tags: prevData.tags.filter(tag => tag.id !== tagId),
      // 2. 全タスクをチェックし、削除するタグIDを tasks.tags 配列から除去
      tasks: prevData.tasks.map(task => ({
        ...task,
        tags: task.tags.filter(id => id !== tagId),
      })),
    }));
  };

  return (
    <div>
      <h1>タグ管理</h1>

      {/* タグ追加フォーム */}
      <AddTagForm onSubmit={handleAddTag}>
        <TagInput
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="新規タグ名..."
        />
        <ColorInput
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
        />
        <AddButton type="submit">＋ 追加</AddButton>
      </AddTagForm>

      {/* タグ一覧 */}
      <TagList>
        {appData.tags.map(tag => (
          <TagListItem key={tag.id}>
            <TagColorPreview color={tag.color} />
            <TagName>{tag.name}</TagName>
            {/* TODO: タグの編集（名前・色変更）機能 */}
            <DeleteButton onClick={() => handleDeleteTag(tag.id)}>
              削除
            </DeleteButton>
          </TagListItem>
        ))}
      </TagList>

      {appData.tags.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center' }}>タグはまだありません。</p>
      )}

    </div>
  );
};