// src/types.ts

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface RepeatConfig {
  type: 'daily' | 'weekly' | 'weekdays';
}

export interface Task {
  id: string;
  content: string;
  projectId: string;
  parentId: string | null;
  status: TaskStatus;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string | null;
  tags: string[];
  repeatConfig: RepeatConfig | null;
  lastCompletedDate: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  sortOrder: number;
  isArchived: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string;
}

export interface AppData {
  projects: Project[];
  tasks: Task[];
  tags: Tag[];
  settings: AppSettings;
}
