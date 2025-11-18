// src/components/TaskItem.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Task, TaskStatus, Tag } from '../types';
import { useData } from '../contexts/DataContext';
import { getTodayString, isOverdue, isDueToday } from '../utils/dateUtils'; // ★ isOverdue, isDueToday を追加
import { Draggable, Droppable } from '@hello-pangea/dnd';

const TaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1px; 
`;

const TaskRow = styled.div<{ status: TaskStatus }>`
  display: flex;
  align-items: flex-start; 
  padding: 4px 8px; 
  border-radius: 4px;
  
  background-color: ${props => props.theme.item};
  border: 1px solid transparent; 

  opacity: ${props => (props.status === 'Done' ? 0.6 : 1)};
  transition: all 0.2s ease-out;

  &:hover {
    background-color: ${props => props.theme.itemHover};
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.subText};
  cursor: pointer;
  font-size: 0.7rem; 
  width: 16px;       
  height: 16px;      
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  margin-top: 4px;   
  padding: 0;
  
  &:hover {
    color: ${props => props.theme.text};
    background-color: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
`;

const ExpandSpacer = styled.div`
  width: 18px; 
  flex-shrink: 0;
`;

const ChildrenContainer = styled.div`
  margin-left: 18px; 
  border-left: 1px solid ${props => props.theme.border}; 
  padding-left: 0px; 
`;

const SubtaskMark = styled.div`
  color: ${props => props.theme.subText};
  font-size: 0.8rem;
  line-height: 1;
  margin-right: 6px;
  margin-top: 5px; 
  user-select: none;
  opacity: 0.5;
`;

const StatusIcon = styled.div<{ status: TaskStatus }>`
  width: 16px; 
  height: 16px;
  border-radius: 4px; 
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px; 
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 3px; 
  transition: all 0.2s ease;

  ${props => {
    switch (props.status) {
      case 'Todo': 
        return `
          border: 1.5px solid ${props.theme.subText};
          background-color: transparent;
          &:hover { border-color: ${props.theme.accent}; }
        `;
      case 'InProgress':
        return `
          border: 1.5px solid ${props.theme.accent};
          background-color: ${props.theme.accent};
          color: white;
          box-shadow: 0 0 8px ${props.theme.accent}66;
        `;
      case 'Done':
        return `
          border: 1.5px solid ${props.theme.success}; 
          background-color: ${props.theme.success};
          color: white;
        `;
    }
  }}
`;

const TaskDetailsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column; 
  justify-content: center; 
  min-height: 22px; 
`;

const ParentTaskBreadcrumb = styled.div`
  font-size: 0.7rem; 
  color: ${props => props.theme.subText};
  margin-bottom: 0px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  opacity: 0.8;
`;

// ★ 追加: タイトルと期限日を横並びにするラッパー
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px; /* タイトルと期限日の間隔 */
`;

const TaskContent = styled.span<{ status: TaskStatus }>`
  font-size: 0.9rem; 
  line-height: 1.4;
  text-decoration: ${props => (props.status === 'Done' ? 'line-through' : 'none')};
  color: ${props => (props.status === 'Done' ? props.theme.subText : props.theme.text)};
  cursor: pointer;
  word-break: break-word;
  transition: color 0.2s ease;
`;

// ★ 追加: 期限日バッジ
const DueDateBadge = styled.span<{ isOverdue: boolean; isToday: boolean }>`
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: normal;
  letter-spacing: 0.03em;
  
  /* 期限の状態に応じた色分け */
  color: ${props => 
    props.isOverdue ? props.theme.danger : 
    props.isToday ? props.theme.accent : 
    props.theme.subText};
  
  background-color: ${props => 
    props.isOverdue ? props.theme.danger + '1A' : // 10%透明度
    props.isToday ? props.theme.accent + '1A' : 
    'transparent'};
    
  border: 1px solid ${props => 
    props.isOverdue ? props.theme.danger + '40' : // 25%透明度
    props.isToday ? props.theme.accent + '40' : 
    props.theme.border};
`;

const TagListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap; 
  margin-top: 2px; 
  gap: 4px; 
`;

const TagBadge = styled.span<{ color: string }>`
  display: inline-block;
  font-size: 0.65rem; 
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px; 
  color: #fff; 
  background-color: ${props => props.color};
  opacity: 0.8; 
  letter-spacing: 0.02em;
`;


interface Props {
  task: Task;
  defaultExpanded?: boolean;
  index?: number;
}

export const TaskItem: React.FC<Props> = ({ task, defaultExpanded = false, index }) => {
  const { appData, setAppData, setEditingTaskId } = useData();
  const { tasks: allTasks, tags: allTags } = appData;

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const childTasks = allTasks
    .filter(t => t.parentId === task.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const hasChildren = childTasks.length > 0;

  const isSubtask = task.parentId !== null;
  const getAncestors = (currentTask: Task): Task[] => {
    const ancestors: Task[] = [];
    let curr = currentTask;
    let depth = 0;
    while (curr.parentId && depth < 10) {
      const parent = allTasks.find(t => t.id === curr.parentId);
      if (parent) {
        ancestors.unshift(parent);
        curr = parent;
        depth++;
      } else {
        break;
      }
    }
    return ancestors;
  };
  const ancestors = task.parentId ? getAncestors(task) : [];

  const allTagsMap = new Map(allTags.map(tag => [tag.id, tag]));
  const taskTags: Tag[] = (task.tags || [])
    .map(tagId => allTagsMap.get(tagId))
    .filter((tag): tag is Tag => tag !== undefined);

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    if (currentStatus === 'Todo') return 'InProgress';
    if (currentStatus === 'InProgress') return 'Done';
    if (currentStatus === 'Done') return 'Todo';
    return 'Todo';
  };

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    const isRepeating = task.repeatConfig !== null;
    let newLastCompletedDate = task.lastCompletedDate;

    if (isRepeating && nextStatus === 'Done') {
      newLastCompletedDate = getTodayString();
    }
    if (isRepeating && nextStatus === 'Todo') {
      newLastCompletedDate = null;
    }

    setAppData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(t =>
        t.id === task.id
          ? { ...t, status: nextStatus, lastCompletedDate: newLastCompletedDate }
          : t
      ),
    }));
  };

  const getStatusIconContent = (status: TaskStatus) => {
    if (status === 'InProgress') return '...';
    if (status === 'Done') return '✓';
    return '';
  }

  const handleOpenModal = () => {
    setEditingTaskId(task.id);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsExpanded(!isExpanded);
  };

  // ★ 追加: 期限日の表示用フォーマット関数 (MM/DD)
  const formatDueDate = (dateString: string) => {
    // "YYYY-MM-DD" -> "MM/DD"
    return dateString.slice(5).replace('-', '/');
  };

  // ★ 追加: 期限切れ・今日判定
  const isOver = isOverdue(task.dueDate);
  const isToday = isDueToday(task.dueDate);

  const renderContent = () => (
    <TaskContainer>
      <TaskRow status={task.status}>
        {hasChildren ? (
          <ExpandButton 
            onClick={toggleExpand}
            onMouseDown={(e) => e.stopPropagation()} 
          >
            {isExpanded ? '▼' : '▶'}
          </ExpandButton>
        ) : (
          <ExpandSpacer />
        )}
        
        {isSubtask && <SubtaskMark>↳</SubtaskMark>}

        <StatusIcon 
          status={task.status} 
          onClick={handleStatusChange}
          onMouseDown={(e) => e.stopPropagation()} 
        >
          {getStatusIconContent(task.status)}
        </StatusIcon>
        
        <TaskDetailsWrapper>
          {ancestors.length > 0 && (
            <ParentTaskBreadcrumb>
               {ancestors.map(ancestor => (
                 <React.Fragment key={ancestor.id}>
                   {ancestor.content} &gt;{' '}
                 </React.Fragment>
               ))}
            </ParentTaskBreadcrumb>
          )}

          {/* ★ 変更: TitleRow でタスク名と期限日を囲む */}
          <TitleRow>
            <TaskContent status={task.status} onClick={handleOpenModal}>
              {task.content}
            </TaskContent>

            {/* 期限日がある場合のみ表示 */}
            {task.dueDate && (
              <DueDateBadge isOverdue={isOver} isToday={isToday}>
                {isOver && "!"} {/* 期限切れならビックリマークもつける */}
                {formatDueDate(task.dueDate)}
              </DueDateBadge>
            )}
          </TitleRow>

          {taskTags.length > 0 && (
            <TagListWrapper>
              {taskTags.map(tag => (
                <TagBadge key={tag.id} color={tag.color}>
                  {tag.name}
                </TagBadge>
              ))}
            </TagListWrapper>
          )}
        </TaskDetailsWrapper>
      </TaskRow>

      {isExpanded && hasChildren && (
        <ChildrenContainer>
          <Droppable 
            droppableId={`task-list-sub-${task.id}`}
            type={`TASK-SUB-${task.id}`}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {childTasks.map((child, i) => (
                  <TaskItem 
                    key={child.id} 
                    task={child} 
                    index={i} 
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ChildrenContainer>
      )}
    </TaskContainer>
  );

  if (typeof index === 'number') {
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...provided.draggableProps.style }}
          >
            {renderContent()}
          </div>
        )}
      </Draggable>
    );
  }

  return renderContent();
};