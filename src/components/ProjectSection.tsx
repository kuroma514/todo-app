// src/components/ProjectSection.tsx
import React, { useState, useCallback } from 'react'; // ★ useCallback を追加
import styled from 'styled-components';
import { Project, Task } from '../types';
import { TaskItem } from './TaskItem';
import { useData } from '../contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const SectionWrapper = styled.section`
  padding: 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  margin-bottom: 16px;
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between; 
  align-items: center;
  margin: 0 0 12px 0;
`;

const ProjectTitle = styled.h2`
  margin: 0; 
  font-size: 1.1rem;
  color: inherit;
  flex: 1; 
  margin-right: 16px;
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
`;

const ProgressBarBg = styled.div`
  width: 80px;
  height: 6px;
  background-color: #444;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 8px;
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background-color: ${props => props.theme.accent};
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 0.8rem;
  color: #888;
  font-weight: bold;
  min-width: 36px;
  text-align: right;
`;

const DeleteProjectButton = styled.button`
  padding: 4px 8px;
  font-size: 0.8rem;
  background-color: #555; 
  color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0; 

  &:hover {
    background-color: #d9534f; 
    color: white;
  }
`;

const AddTaskForm = styled.form`
  display: flex;
  margin-top: 10px;
`;
const TaskInput = styled.input`
  flex: 1;
  padding: 8px;
  font-size: 0.9rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: white;
`;
const AddTaskButton = styled.button`
  padding: 8px 12px;
  font-size: 0.9rem;
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

interface Props {
  project: Project;
  tasks: Task[]; 
}

export const ProjectSection: React.FC<Props> = ({ project, tasks }) => {
  const { appData, setAppData } = useData();
  const [newTaskContent, setNewTaskContent] = useState('');

  // --- ★ 変更: 階層構造を考慮した進捗計算ロジック ---
  // プロジェクトに属する全タスクを取得（計算用）
  const allProjectTasks = appData.tasks.filter(t => t.projectId === project.id);

  // 特定のタスクの進捗率 (0.0 〜 1.0) を再帰的に計算する関数
  const calculateTaskProgress = useCallback((taskId: string): number => {
    const task = allProjectTasks.find(t => t.id === taskId);
    if (!task) return 0;

    // 1. 自身が完了なら、子に関わらず 100% (1.0)
    // (習慣タスク以外で判定。習慣タスクは完了してもすぐ戻るため、完了時は1.0とする)
    if (task.status === 'Done') {
      return 1;
    }

    // 2. 子タスクを取得
    const children = allProjectTasks.filter(t => t.parentId === taskId);

    // 3. 子がいなくて未完了なら 0%
    if (children.length === 0) {
      return 0;
    }

    // 4. 子がいる場合、子の進捗の平均値を返す
    const totalChildProgress = children.reduce((sum, child) => {
      return sum + calculateTaskProgress(child.id);
    }, 0);

    return totalChildProgress / children.length;
  }, [allProjectTasks]);

  // プロジェクト全体の進捗計算
  // ルートタスク（親を持たないタスク）を取得
  const rootTasksForCalc = allProjectTasks.filter(t => t.parentId === null);
  
  let progressPercent = 0;
  if (rootTasksForCalc.length > 0) {
    const totalProgress = rootTasksForCalc.reduce((sum, rootTask) => {
      return sum + calculateTaskProgress(rootTask.id);
    }, 0);
    // ルートタスクの平均 × 100
    progressPercent = Math.round((totalProgress / rootTasksForCalc.length) * 100);
  }
  // -----------------------------------------------------


  const projectTasks = tasks;
  const visibleTaskIds = new Set(projectTasks.map(t => t.id));

  const renderRootTasks = projectTasks
    .filter(t => {
      const isTopLevel = t.parentId === null;
      const isOrphan = t.parentId !== null && !visibleTaskIds.has(t.parentId);
      return isTopLevel || isOrphan;
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    const currentMaxSortOrder = renderRootTasks.length > 0
      ? Math.max(...renderRootTasks.map(t => t.sortOrder ?? 0))
      : -1;

    const newTask: Task = {
      id: uuidv4(),
      content: newTaskContent.trim(),
      projectId: project.id,
      parentId: null, 
      status: 'Todo',
      priority: 'Medium',
      dueDate: null,
      tags: [],
      repeatConfig: null,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
      sortOrder: currentMaxSortOrder + 1,
    };

    setAppData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setNewTaskContent('');
  };

  const handleDeleteProject = () => {
    if (!window.confirm(
      `プロジェクト「${project.name}」を削除しますか？\nこのプロジェクトに含まれるすべてのタスクも削除されます。`
    )) {
      return;
    }

    setAppData(prevData => {
      const newProjects = prevData.projects.filter(p => p.id !== project.id);
      const newTasks = prevData.tasks.filter(t => t.projectId !== project.id);
      
      return {
        ...prevData,
        projects: newProjects,
        tasks: newTasks,
      };
    });
  };

  return (
    <SectionWrapper>
      <ProjectHeader>
        <ProjectTitle>{project.name}</ProjectTitle>
        
        <ProgressWrapper>
          <ProgressBarBg>
            <ProgressBarFill percent={progressPercent} />
          </ProgressBarBg>
          <ProgressText>{progressPercent}%</ProgressText>
        </ProgressWrapper>

        <DeleteProjectButton onClick={handleDeleteProject}>
          削除
        </DeleteProjectButton>
      </ProjectHeader>

      <Droppable 
        droppableId={`task-list-root-${project.id}`} 
        type={`TASK-ROOT-${project.id}`}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {renderRootTasks.map((rootTask, index) => (
              <TaskItem 
                key={rootTask.id} 
                task={rootTask} 
                index={index} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {projectTasks.length === 0 && (
        <p style={{ color: '#888' }}>タスクはありません</p>
      )}

      <AddTaskForm onSubmit={handleAddTask}>
        <TaskInput
          type="text"
          value={newTaskContent}
          onChange={e => setNewTaskContent(e.target.value)}
          placeholder="＋ 親タスクを追加..." 
        />
        <AddTaskButton type="submit">追加</AddTaskButton>
      </AddTaskForm>
    </SectionWrapper>
  );
};