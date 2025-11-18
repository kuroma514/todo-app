// src/utils/dateUtils.ts
// (このファイルは新規作成です)

/**
 * "今日" の日付を YYYY-MM-DD 形式の文字列で取得します。
 * (例: "2025-11-18")
 */
export const getTodayString = (): string => {
  const today = new Date();
  const y = today.getFullYear();
  // getMonth() は 0-11 を返すため +1 する
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 期限日が今日かどうかを判定します。
 * @param dueDate "YYYY-MM-DD" 形式の期限日文字列 (または null)
 */
export const isDueToday = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  return dueDate === getTodayString();
};

/**
 * 期限切れかどうかを判定します。
 * (今日より過去の日付か)
 * @param dueDate "YYYY-MM-DD" 形式の期限日文字列 (または null)
 */
export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const todayStr = getTodayString();
  // 文字列の比較で判定可能
  return dueDate < todayStr;
};

/**
 * ★ 追加: 今日が平日（月〜金）かどうかを判定します。
 */
export const isTodayWeekday = (): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (日曜) 〜 6 (土曜)
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 1〜5 が 月〜金
};