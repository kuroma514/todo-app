// src/components/TaskDetailModal.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { Task } from '../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #555;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  z-index: 1001;
  color: white;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const FormField = styled.div`
  margin-bottom: 16px;
  label { display:block; margin-bottom:6px; color:#aaa }
  input, select, textarea {
    width:100%; padding:8px; font-size:1rem; background:#333; color:white; border:1px solid #555; border-radius:4px; box-sizing:border-box; font-family:inherit;
  }
  textarea { min-height:80px; resize:vertical }
`;

const SaveButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #2998ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export const TaskDetailModal: React.FC = () => {
  const { editingTaskId, setEditingTaskId, appData, setAppData } = useData();
  const editingTask = appData.tasks.find(t => t.id === editingTaskId);

  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Task['priority']>('Medium');

  useEffect(() => {
    if (editingTask) {
      setContent(editingTask.content);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleClose = () => setEditingTaskId(null);
  const handleSave = () => {
    setAppData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === editingTaskId ? { ...t, content, dueDate, priority } : t) }));
    handleClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        <h2>タスクの詳細</h2>
        <FormField>
          <label htmlFor="task-content">タスク名</label>
          <textarea id="task-content" value={content} onChange={e=>setContent(e.target.value)} />
        </FormField>
        <FormField>
          <label htmlFor="task-duedate">期限日</label>
          <input id="task-duedate" type="date" value={dueDate||''} onChange={e=>setDueDate(e.target.value||null)} />
        </FormField>
        <FormField>
          <label htmlFor="task-priority">優先度</label>
          <select id="task-priority" value={priority} onChange={e=>setPriority(e.target.value as Task['priority'])}>
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        </FormField>
        <SaveButton onClick={handleSave}>保存</SaveButton>
      </ModalContent>
    </ModalOverlay>
  );
};
