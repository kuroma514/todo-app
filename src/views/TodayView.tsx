// src/views/TodayView.tsx
import React from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { ProjectSection } from '../components/ProjectSection';
import { Task } from '../types';
import { isDueToday, isOverdue, isTodayWeekday, getTodayString } from '../utils/dateUtils';
// ★ 追加: ドラッグ＆ドロップ用
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

const NoTasksMessage = styled.p`
  color: #888;
  text-align: center;
  margin-top: 40px;
`;

export const TodayView: React.FC = () => {
  const { appData, setAppData } = useData(); // ★ setAppData も取得
  const { tasks, projects } = appData;

  const todayStr = getTodayString();
  const todayIsWeekday = isTodayWeekday();

  // --- フィルタリングロジック ---
  const todayTasks = tasks.filter(task => {
    if (task.status === 'Done') return false;
    if (isDueToday(task.dueDate)) return true;
    if (isOverdue(task.dueDate)) return true;
    if (task.repeatConfig) {
      if (task.repeatConfig.type === 'daily') return true;
      if (task.repeatConfig.type === 'weekdays' && todayIsWeekday) return true;
    }
    return false;
  });

  const tasksByProjectId: { [key: string]: Task[] } = {};
  for (const task of todayTasks) {
    if (!tasksByProjectId[task.projectId]) {
      tasksByProjectId[task.projectId] = [];
    }
    tasksByProjectId[task.projectId].push(task);
  }

  const projectsToShow = projects
    .filter(p => !p.isArchived && tasksByProjectId[p.id])
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // ★ 追加: ドラッグ終了時の処理 (AllProjectsViewと同じタスク並び替えロジック)
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // タスクの並び替え (TodayViewではプロジェクト自体の並び替えは行わないのでTASKのみ)
    if (type.startsWith("TASK")) {
      const movedTaskId = result.draggableId;
      
      setAppData(prevData => {
        const allTasks = prevData.tasks;
        const movedTask = allTasks.find(t => t.id === movedTaskId);
        
        if (!movedTask) return prevData;

        // 兄弟タスクを取得
        let siblings: typeof allTasks = [];
        if (movedTask.parentId) {
          siblings = allTasks.filter(t => t.parentId === movedTask.parentId);
        } else {
          siblings = allTasks.filter(t => t.projectId === movedTask.projectId && t.parentId === null);
        }

        // ソート
        siblings.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        // 移動
        const newSiblings = Array.from(siblings);
        const [removed] = newSiblings.splice(source.index, 1);
        newSiblings.splice(destination.index, 0, removed);

        // sortOrder更新
        const updatedSiblingsMap = new Map();
        newSiblings.forEach((t, i) => {
          updatedSiblingsMap.set(t.id, i);
        });

        const newAllTasks = allTasks.map(t => {
          if (updatedSiblingsMap.has(t.id)) {
            return { ...t, sortOrder: updatedSiblingsMap.get(t.id) };
          }
          return t;
        });

        return {
          ...prevData,
          tasks: newAllTasks,
        };
      });
    }
  };

  return (
    // ★ 追加: 全体を DragDropContext で囲む
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <h1>今日やること</h1>

        {projectsToShow.length === 0 && (
          <NoTasksMessage>今日やるタスクはありません。</NoTasksMessage>
        )}

        {projectsToShow.map(project => (
          <ProjectSection
            key={project.id}
            project={project}
            tasks={tasksByProjectId[project.id]}
          />
        ))}
      </div>
    </DragDropContext>
  );
};