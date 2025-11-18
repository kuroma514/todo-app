// src/components/TaskDetailModal.tsx
import React, { useEffect, useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import { Task, RepeatConfig, TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TaskItem } from './TaskItem';

// モーダルの背景
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px 0;
`;

// モーダルの本体
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
  margin: auto 0;
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
  label {
    display: block;
    margin-bottom: 6px;
    color: #aaa;
  }
  input, select, textarea {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
    background-color: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: inherit;
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const SaveButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TagSelectionArea = styled.div`
  max-height: 150px;
  overflow-y: auto;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px;
`;

const TagCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  
  input[type="checkbox"] {
    width: auto;
    margin-right: 10px;
  }
  
  label {
    margin-bottom: 0;
    color: #E0E0E0;
    display: flex;
    align-items: center;
  }
`;

const TagColorPreview = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

const SubtaskAddForm = styled.form`
  display: flex;
  margin-top: 8px;
`;
const SubtaskInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  font-size: 0.9rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #333;
  color: white;
`;
const SubtaskAddButton = styled.button`
  padding: 6px 10px;
  font-size: 0.9rem;
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

const SubtaskListWrapper = styled.div`
  & > div {
    background-color: #333;
    border-color: #555;
  }
`;


export const TaskDetailModal: React.FC = () => {
  const { editingTaskId, setEditingTaskId, appData, setAppData } = useData();
  const { tags: allTags, tasks: allTasks } = appData;

  const editingTask = allTasks.find(t => t.id === editingTaskId);
  
  // ★ 変更: サブタスクを sortOrder でソート
  const subTasks = (editingTask 
    ? allTasks.filter(t => t.parentId === editingTask.id)
    : []
  ).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [repeatType, setRepeatType] = useState<string>("none"); 
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newSubtaskContent, setNewSubtaskContent] = useState("");


  useEffect(() => {
    if (editingTask) {
      setContent(editingTask.content);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setRepeatType(editingTask.repeatConfig?.type || "none");
      setSelectedTagIds(new Set(editingTask.tags || []));
    }
  }, [editingTask]);

  if (!editingTask) {
    return null;
  }

  const handleClose = () => {
    setEditingTaskId(null);
  };

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tagId = e.target.value;
    const isChecked = e.target.checked;
    setSelectedTagIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(tagId);
      } else {
        newSelected.delete(tagId);
      }
      return newSelected;
    });
  };

  const handleSave = () => {
    let newRepeatConfig: RepeatConfig | null = null;
    if (repeatType === "daily") {
      newRepeatConfig = { type: "daily" };
    } else if (repeatType === "weekdays") {
      newRepeatConfig = { type: "weekdays" };
    }
    const newTagsArray = Array.from(selectedTagIds);

    setAppData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(t =>
        t.id === editingTaskId
          ? {
              ...t,
              content: content,
              dueDate: dueDate,
              priority: priority,
              repeatConfig: newRepeatConfig,
              tags: newTagsArray,
            }
          : t
      ),
    }));
    handleClose();
  };

  const handleDelete = () => {
    if (!window.confirm(
      "本当にこのタスクを削除しますか？\n(サブタスクがある場合、それらも削除されます)"
    )) {
      return;
    }
    const idsToDelete = new Set<string>();
    idsToDelete.add(editingTaskId!);
    appData.tasks.forEach(task => {
      if (task.parentId === editingTaskId) {
        idsToDelete.add(task.id);
      }
    });
    setAppData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.filter(t => !idsToDelete.has(t.id)),
    }));
    handleClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskContent.trim()) return;

    // ★ 追加: 次の sortOrder を計算
    const currentMaxSortOrder = subTasks.length > 0
      ? Math.max(...subTasks.map(t => t.sortOrder ?? 0))
      : -1;

    const newSubtask: Task = {
      id: uuidv4(),
      content: newSubtaskContent.trim(),
      projectId: editingTask.projectId,
      parentId: editingTask.id,
      status: 'Todo',
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
      tags: [],
      repeatConfig: null,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
      
      // ★ 追加
      sortOrder: currentMaxSortOrder + 1,
    };

    setAppData(prev => ({ 
      ...prev, 
      tasks: [...prev.tasks, newSubtask] 
    }));
    setNewSubtaskContent('');
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        <h2>タスクの詳細</h2>

        <FormField>
          <label htmlFor="task-content">タスク名</label>
          <textarea
            id="task-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>
        
        <FormField>
          <label htmlFor="task-subtasks">サブタスク</label>
          <SubtaskListWrapper>
            {/* モーダル内ではD&Dを実装しないため、単にリスト表示 */}
            {subTasks.map(subtask => (
              <TaskItem key={subtask.id} task={subtask} />
            ))}
            {subTasks.length === 0 && (
              <span style={{ color: '#888', fontSize: '0.9rem' }}>
                （サブタスクはありません）
              </span>
            )}
          </SubtaskListWrapper>
          
          <SubtaskAddForm onSubmit={handleAddSubtask}>
            <SubtaskInput
              type="text"
              value={newSubtaskContent}
              onChange={(e) => setNewSubtaskContent(e.target.value)}
              placeholder="＋ サブタスクを追加..."
            />
            <SubtaskAddButton type="submit">追加</SubtaskAddButton>
          </SubtaskAddForm>
        </FormField>

        <FormField>
          <label htmlFor="task-duedate">期限日</label>
          <input
            id="task-duedate"
            type="date"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value || null)}
          />
        </FormField>

        <FormField>
          <label htmlFor="task-priority">優先度</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
          >
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        </FormField>

        <FormField>
          <label htmlFor="task-repeat">繰り返し</label>
          <select
            id="task-repeat"
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value)}
          >
            <option value="none">なし</option>
            <option value="daily">毎日</option>
            <option value="weekdays">平日のみ</option>
          </select>
        </FormField>

        <FormField>
          <label htmlFor="task-tags">タグ</label>
          <TagSelectionArea>
            {allTags.length === 0 && (
              <span style={{ color: '#888' }}>（タグがありません）</span>
            )}
            {allTags.map(tag => (
              <TagCheckboxItem key={tag.id}>
                <input
                  type="checkbox"
                  id={`tag-${tag.id}`}
                  value={tag.id}
                  checked={selectedTagIds.has(tag.id)}
                  onChange={handleTagChange}
                />
                <label htmlFor={`tag-${tag.id}`}>
                  <TagColorPreview color={tag.color} />
                  {tag.name}
                </label>
              </TagCheckboxItem>
            ))}
          </TagSelectionArea>
        </FormField>

        <ModalFooter>
          <DeleteButton onClick={handleDelete}>
            削除
          </DeleteButton>
          <SaveButton onClick={handleSave}>
            保存
          </SaveButton>
        </ModalFooter>
        
      </ModalContent>
    </ModalOverlay>
  );
};