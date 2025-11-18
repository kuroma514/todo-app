// src/components/ProjectSection.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Project, Task } from '../types';
import { TaskItem } from './TaskItem';
import { useData } from '../contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';

const SectionWrapper = styled.section`
  padding: 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  margin-bottom: 16px;
`;
const ProjectTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: inherit;
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
  background-color: #2998ff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

interface Props { project: Project; tasks: Task[] }

export const ProjectSection: React.FC<Props> = ({ project, tasks }) => {
  const { setAppData } = useData();
  const [newTaskContent, setNewTaskContent] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const sortedTasks = projectTasks.filter(t => t.parentId === null).slice().sort((a,b)=> a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
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
    };
    setAppData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setNewTaskContent('');
  };

  return (
    <SectionWrapper>
      <ProjectTitle>{project.name}</ProjectTitle>
      <div>
        {sortedTasks.map(task => <TaskItem key={task.id} task={task} />)}
        {projectTasks.length === 0 && <p style={{color:'#888'}}>タスクはありません</p>}
      </div>

      <AddTaskForm onSubmit={handleAddTask}>
        <TaskInput type="text" value={newTaskContent} onChange={e=>setNewTaskContent(e.target.value)} placeholder="＋ タスクを追加..." />
        <AddTaskButton type="submit">追加</AddTaskButton>
      </AddTaskForm>
    </SectionWrapper>
  );
};
// src/components/ProjectSection.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { Project, Task } from '../types';
import { TaskItem } from './TaskItem';
import { useData } from '../contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';

const SectionWrapper = styled.section`
  padding: 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  margin-bottom: 16px;
`;
const ProjectTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: inherit;
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
  background-color: #2998ff;
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
  const { setAppData } = useData();
  const [newTaskContent, setNewTaskContent] = useState('');

  // このプロジェクトに紐づくトップレベルタスクを取得して作成日時でソート
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const sortedTasks = projectTasks
    .filter(t => t.parentId === null)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

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
    };

    setAppData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setNewTaskContent('');
  };

  return (
    <SectionWrapper>
      <ProjectTitle>{project.name}</ProjectTitle>

      <div>
        {sortedTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}

        {projectTasks.length === 0 && (
          <p style={{ color: '#888' }}>タスクはありません</p>
        )}
      </div>

      <AddTaskForm onSubmit={handleAddTask}>
        <TaskInput
          type="text"
          value={newTaskContent}
          onChange={e => setNewTaskContent(e.target.value)}
          placeholder="＋ タスクを追加..."
        />
        <AddTaskButton type="submit">追加</AddTaskButton>
      </AddTaskForm>
    </SectionWrapper>
  );
};