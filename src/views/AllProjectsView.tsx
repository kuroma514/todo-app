// src/views/AllProjectsView.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { ProjectSection } from '../components/ProjectSection';
import { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

const AddProjectForm = styled.form`
  display:flex; margin-bottom:20px;
`;
const ProjectInput = styled.input`
  flex:1; padding:10px; font-size:1rem; border:1px solid #555; border-radius:4px; background:#2a2a2a; color:white;
`;
const AddButton = styled.button`
  padding:10px 15px; font-size:1rem; background:#2998ff; color:white; border:none; border-radius:4px; margin-left:10px; cursor:pointer;
`;

export const AllProjectsView: React.FC = () => {
  const { appData, setAppData } = useData();
  const [newProjectName, setNewProjectName] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProject: Project = { id: uuidv4(), name: newProjectName, sortOrder: appData.projects.length, isArchived:false };
    setAppData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setNewProjectName('');
  };

  return (
    <div>
      <h1>全てのタスク</h1>
      <AddProjectForm onSubmit={handleAddProject}>
        <ProjectInput type="text" value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} placeholder="新規プロジェクト名..." />
        <AddButton type="submit">＋ 追加</AddButton>
      </AddProjectForm>

      {appData.projects.filter(p=>!p.isArchived).sort((a,b)=>a.sortOrder-b.sortOrder).map(project=>{
        const tasksForProject = appData.tasks.filter(t => t.projectId === project.id);
        return <ProjectSection key={project.id} project={project} tasks={tasksForProject} />;
      })}
    </div>
  );
};
