// src/contexts/DataContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'; // ★ useEffectを追加
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppData, Task } from '../types'; // ★ Task をインポート
import { getTodayString, isTodayWeekday } from '../utils/dateUtils'; // ★ ユーティリティをインポート

// 1. 保存するデータの「初期値」
const initialData: AppData = {
  projects: [],
  tasks: [],
  tags: [],
  settings: {
    theme: "dark",
    accentColor: "#2998ff",
  },
};

// 2. Contextに「何が入るか」の型を定義
// (ここではデータと、それを更新する関数)
interface DataContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;

  // ★ 追加: 編集中のタスクIDを管理する state
  editingTaskId: string | null;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}

// 3. Context を作成
// (中身が空っぽなのは、後で Provider からデータを渡すため)
const DataContext = createContext<DataContextType | undefined>(undefined);

// 4. アプリ全体にデータを配る「Provider」コンポーネント
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 5. ここで、さっき作った useLocalStorageフック を使う！
  // これで appData が変更されると自動でローカルストレージに保存される
  const [appData, setAppData] = useLocalStorage<AppData>("todo-app-data", initialData);

  // ★ 追加: モーダルのためのローカルな state
  // (これはローカルストレージに保存する必要はない)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // ★ 追加: 習慣タスクの自動リセットロジック
  useEffect(() => {
    const todayStr = getTodayString();
    const todayIsWeekday = isTodayWeekday();

    const tasksToReset = appData.tasks.filter(task => {
      // 1. 習慣タスクで
      if (!task.repeatConfig) return false;
      // 2. 「完了」状態で
      if (task.status !== 'Done') return false;
      // 3. 「最後に完了した日」が「今日」ではない
      //    (＝今日まだリセットされてない)
      if (task.lastCompletedDate === todayStr) return false;

      // 4. リセット条件のチェック
      if (task.repeatConfig.type === 'daily') {
        return true; // 「毎日」タスクは常にリセット対象
      }
      if (task.repeatConfig.type === 'weekdays' && todayIsWeekday) {
        return true; // 「平日のみ」タスクは今日が平日ならリセット対象
      }

      return false;
    });

    // リセット対象のタスクが見つかった場合のみ、状態を更新
    if (tasksToReset.length > 0) {
      const resetTaskIds = tasksToReset.map(t => t.id);

      setAppData(prevData => ({
        ...prevData,
        tasks: prevData.tasks.map(task =>
          // リセット対象ID配列に含まれていれば
          resetTaskIds.includes(task.id)
            // 状態を「未着手」に戻し、完了日をリセット
            ? { ...task, status: 'Todo', lastCompletedDate: null }
            : task // それ以外はそのまま
        ),
      }));
    }
    // appData.tasks が変更されるたびに実行されると無限ループするため、
    // 依存配列から appData を外し、setAppData の関数型更新を使う。
    // しかし、useLocalStorage が返す appData を基準にしたいので、
    // appData が変更された「後」に実行されるようにする。
    // ※注意：このロジックは起動時1回（または日付変更時）に
    //   実行するのが理想だが、簡略化のため appData 依存で実行する。
    //   ただし、無限ループを避けるためロジックを工夫した。
    //   （本当は appData.tasks の「中身」が変わった時だけ実行したい）

    // 結論：依存配列を [appData.tasks, setAppData] とし、
    //       リセットロジックが無限ループしないよう
    //       「lastCompletedDate === todayStr」のチェックを入れた。
  }, [appData.tasks, setAppData]);


  return (
    // ★ 変更点: value に editingTaskId と setEditingTaskId を追加
    <DataContext.Provider value={{ appData, setAppData, editingTaskId, setEditingTaskId }}>
      {children}
    </DataContext.Provider>
  );
};

// 6. データを簡単に取り出すためのカスタムフック
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};