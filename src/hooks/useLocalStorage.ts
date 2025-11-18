// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// T は <AppData> のような型を受け取るための「ジェネリクス」
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {

  // 1. stateの初期化
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // ブラウザのローカルストレージからデータを取得
      const item = window.localStorage.getItem(key);
      // データがあればパース(JSON文字列をオブジェクトに戻す)、なければ初期値
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 2. stateが変更されたら、ローカルストレージに保存
  // (useEffect の使い方の応用です)
  useEffect(() => {
    try {
      // state (storedValue) をJSON文字列に変換
      const valueToStore = JSON.stringify(storedValue);
      // ローカルストレージに保存
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]); // state (storedValue) が変わったら実行

  // 3. 通常の useState と同じように、値とセッター関数を返す
  return [storedValue, setStoredValue];
}