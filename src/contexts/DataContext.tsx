// src/contexts/DataContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppData } from '../types';

const initialData: AppData = {
  projects: [],
  tasks: [],
  tags: [],
  settings: {
    theme: 'dark',
    accentColor: '#2998ff',
  },
};

interface DataContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;

  editingTaskId: string | null;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useLocalStorage<AppData>('todo-app-data', initialData);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  return (
    <DataContext.Provider value={{ appData, setAppData, editingTaskId, setEditingTaskId }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
