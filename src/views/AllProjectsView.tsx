// src/views/AllProjectsView.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { ProjectSection } from '../components/ProjectSection';
import { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const AddProjectForm = styled.form`
  display: flex;
  margin-bottom: 20px;
`;

const ProjectInput = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.panel};
  color: ${props => props.theme.text};
`;

const AddButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
`;

const DraggableWrapper = styled.div`
  margin-bottom: 16px;
`;

const DragHandle = styled.div`
  width: 20px;
  height: 20px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: #888;
  
  &::before {
    content: '⣿'; 
    font-size: 1.2rem;
    line-height: 1;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const ProjectContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

const ProjectContent = styled.div`
  flex: 1;
`;


export const AllProjectsView: React.FC = () => {
  const { appData, setAppData } = useData();
  const [newProjectName, setNewProjectName] = useState("");
  
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const activeProjects = appData.projects
      .filter(p => !p.isArchived)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setSortedProjects(activeProjects);
  }, [appData.projects]);


  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: uuidv4(),
      name: newProjectName,
      sortOrder: appData.projects.length,
      isArchived: false,
    };

    setAppData(prevData => ({
      ...prevData,
      projects: [...prevData.projects, newProject],
    }));

    setNewProjectName("");
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // --- 1. プロジェクトの並び替え ---
    if (type === "PROJECT") { // Default type for standard droppable is often "DEFAULT" but explicitly checking is safer if we set it
       // しかし、Droppable id="projects-list" の type を指定していない場合、デフォルトは "DEFAULT" になる。
       // タスク側には "TASK-..." という明示的な type をつけたので、
       // ここではdroppableId で判定するのが確実。
       if (source.droppableId === "projects-list") {
          const newProjects = Array.from(sortedProjects);
          const [movedProject] = newProjects.splice(source.index, 1);
          newProjects.splice(destination.index, 0, movedProject);

          setSortedProjects(newProjects);

          setAppData(prevData => {
            const otherProjects = prevData.projects.filter(p => p.isArchived);
            const updatedActiveProjects = newProjects.map((p, index) => ({
              ...p,
              sortOrder: index,
            }));

            return {
              ...prevData,
              projects: [...updatedActiveProjects, ...otherProjects],
            };
          });
       }
       return;
    }

    // --- 2. タスクの並び替え ---
    // タスクの Droppable type は "TASK-ROOT-..." または "TASK-SUB-..."
    if (type.startsWith("TASK")) {
      
      // ソースと同じリスト内での移動のみ許可されている（typeが一致するため）
      // 並び替える対象のタスクリストを特定する
      
      // 1. 関係するタスク（兄弟タスク）を取得
      // Droppable ID から 親ID (またはプロジェクトID) を解析する手もあるが、
      // appData から直接探すほうが安全。
      
      // 移動したタスクID
      const movedTaskId = result.draggableId;
      
      setAppData(prevData => {
        const allTasks = prevData.tasks;
        const movedTask = allTasks.find(t => t.id === movedTaskId);
        
        if (!movedTask) return prevData;

        // 兄弟タスク（同じ親、または同じプロジェクトのルート）を取得
        let siblings: typeof allTasks = [];
        
        if (movedTask.parentId) {
          // サブタスクの場合：同じ親を持つタスク
          siblings = allTasks.filter(t => t.parentId === movedTask.parentId);
        } else {
          // ルートタスクの場合：同じプロジェクトで、親を持たないタスク
          siblings = allTasks.filter(t => t.projectId === movedTask.projectId && t.parentId === null);
        }

        // 現在の sortOrder でソート
        siblings.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        // 配列内での移動
        const newSiblings = Array.from(siblings);
        const [removed] = newSiblings.splice(source.index, 1);
        newSiblings.splice(destination.index, 0, removed);

        // sortOrder を再採番（連番にする）
        // ここで、siblings 以外のタスクはそのまま、siblings だけ sortOrder を更新する
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
    <div>
      <h1>全てのタスク</h1>

      <AddProjectForm onSubmit={handleAddProject}>
        <ProjectInput
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="新規プロジェクト名..."
        />
        <AddButton type="submit">＋ 追加</AddButton>
      </AddProjectForm>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* プロジェクトリストのDroppable */}
        <Droppable droppableId="projects-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedProjects.map((project, index) => {
                const tasksForProject = appData.tasks.filter(
                  task => task.projectId === project.id
                );

                return (
                  <Draggable 
                    key={project.id} 
                    draggableId={project.id} 
                    index={index}
                  >
                    {(provided) => (
                      <DraggableWrapper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <ProjectContainer>
                          <DragHandle {...provided.dragHandleProps}>
                          </DragHandle>
                          
                          <ProjectContent>
                            <ProjectSection
                              project={project}
                              tasks={tasksForProject}
                            />
                          </ProjectContent>
                        </ProjectContainer>
                      </DraggableWrapper>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};