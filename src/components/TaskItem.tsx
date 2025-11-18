// src/components/TaskItem.tsx
import React from 'react';
import styled from 'styled-components';
import { Task, TaskStatus } from '../types';
import { useData } from '../contexts/DataContext';

// ItemWrapper のスタイル
const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 6px;
`;

const StatusIcon = styled.div<{ status: TaskStatus }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;

  ${props => {
    switch (props.status) {
      case 'Todo':
        return `border: 2px solid #888; background-color: transparent;`;
      case 'InProgress':
        return `border: 2px solid #2998ff; background-color: #2998ff; color: white;`;
      case 'Done':
        return `border: 2px solid #33a34a; background-color: #33a34a; color: white;`;
    }
  }}
`;

const TaskContent = styled.span<{ status: TaskStatus }>`
  flex: 1;
  text-decoration: ${props => (props.status === 'Done' ? 'line-through' : 'none')};
  color: inherit;
`;

interface Props { task: Task }

export const TaskItem: React.FC<Props> = ({ task }) => {
  const { setAppData } = useData();

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'Todo') return 'InProgress';
    if (current === 'InProgress') return 'Done';
    return 'Todo';
  };

  const handleStatusChange = () => {
    const next = getNextStatus(task.status);
    setAppData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: next } : t) }));
  };

  return (
    <ItemWrapper>
      <StatusIcon status={task.status} onClick={handleStatusChange}>
        {task.status === 'Done' ? '✓' : task.status === 'InProgress' ? '...' : ''}
      </StatusIcon>
      <TaskContent status={task.status}>{task.content}</TaskContent>
    </ItemWrapper>
  );
};
// src/components/TaskItem.tsx
import React from 'react';
import styled from 'styled-components';
import { Task, TaskStatus } from '../types'; // TaskStatus をインポート
import { useData } from '../contexts/DataContext'; // ★ useDataをインポート

// ... ItemWrapper のスタイル定義 ...
// ★ 応急処置: ItemWrapper に基本的なレイアウトとコントラストを付与
const ItemWrapper = styled.div<{ isSubtask?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  /* 背景が暗めなので文字は明るくしておく */
  color: #eee;
  /* サブタスク用のインデント */
  margin-left: ${props => (props.isSubtask ? '30px' : '0px')};
`;

// ★ 変更点: StatusIconのスタイルを status に応じて変える
const StatusIcon = styled.div<{ status: TaskStatus }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0; /* 縮まないように設定 */

  /* statusの値に応じてスタイルを動的に変更 */
  ${props => {
    switch (props.status) {
      case 'Todo': // 未着手
        return `
          border: 2px solid #888;
          background-color: transparent;
        `;
      case 'InProgress': // 作業中
        return `
          border: 2px solid #2998ff;
          background-color: #2998ff;
          color: white;
        `;
      case 'Done': // 完了
        return `
          border: 2px solid #33a34a;
          background-color: #33a34a;
          color: white;
        `;
    }
  }}
`;

// ★ 追加: 完了タスクのスタイル
const TaskContent = styled.span<{ status: TaskStatus }>`
  flex: 1;
  font-size: 0.95rem;
  /* 完了したら取り消し線と色を薄くする */
  text-decoration: ${props => (props.status === 'Done' ? 'line-through' : 'none')};
  color: ${props => (props.status === 'Done' ? '#888' : '#fff')};
  /* 長いテキストは折り返して見切れないようにする */
  word-break: break-word;
  
  /* ★ 追加: クリックできるようにカーソルを変更 */
  cursor: pointer;
  padding: 4px 0; /* クリック領域を少し広げる */
`;


interface Props {
  task: Task;
}

export const TaskItem: React.FC<Props> = ({ task }) => {
  const isSubtask = task.parentId !== null;

  // ★ 変更点: setEditingTaskId も Context から取得
  const { setAppData, setEditingTaskId } = useData();

  // ★ 追加: 次の状態を決定する関数
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    if (currentStatus === 'Todo') return 'InProgress';
    if (currentStatus === 'InProgress') return 'Done';
    if (currentStatus === 'Done') return 'Todo';
    return 'Todo';
  };

  // ★ 追加: アイコンクリック時の処理
  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);

    // グローバルな状態を更新
    setAppData(prevData => ({
      ...prevData,
      // tasks配列をmapでループ処理
      tasks: prevData.tasks.map(t =>
        // IDが一致するタスクだけ、statusを更新
        t.id === task.id ? { ...t, status: nextStatus } : t
      ),
    }));
  };

  // ★ 追加: アイコンに表示する文字
  const getStatusIconContent = (status: TaskStatus) => {
    if (status === 'InProgress') return '...';
    if (status === 'Done') return '✓';
    return '';
  }

  // ★ 追加: タスク名クリック時の処理
  const handleOpenModal = () => {
    setEditingTaskId(task.id); // グローバルの状態を「このタスクID」にセット
  };

  return (
    <ItemWrapper isSubtask={isSubtask}>
      {/* ★ 変更点: クリックイベントと動的なスタイルを適用 */}
      <StatusIcon status={task.status} onClick={handleStatusChange}>
        {getStatusIconContent(task.status)}
      </StatusIcon>

      {/* ★ 変更点: TaskContentで囲み、statusを渡し、onClickイベントに handleOpenModal を設定 */}
      <TaskContent status={task.status} onClick={handleOpenModal}>
        {task.content}
      </TaskContent>
    </ItemWrapper>
  );
};