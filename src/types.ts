// src/types.ts

// タスクの状態
export type TaskStatus = "Todo" | "InProgress" | "Done";

// 繰り返し設定の型
export interface RepeatConfig {
  type: "daily" | "weekdays";
}

// タスクの型
export interface Task {
  id: string;
  content: string;
  projectId: string;
  parentId: string | null;
  status: TaskStatus;
  priority: "High" | "Medium" | "Low";
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  
  // ★ 追加: 並び順
  sortOrder: number; 

  repeatConfig: RepeatConfig | null;
  lastCompletedDate: string | null;
}

// プロジェクトの型
export interface Project {
  id: string;
  name: string;
  sortOrder: number;
  isArchived: boolean;
}

// タグの型
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// アプリ全体の設定の型
export interface AppSettings {
  theme: "dark" | "light";
  accentColor: string;
}

// アプリ全体のデータ
export interface AppData {
  projects: Project[];
  tasks: Task[];
  tags: Tag[];
  settings: AppSettings;
}