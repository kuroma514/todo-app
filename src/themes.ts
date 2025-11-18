// src/themes.ts

// styled-components の DefaultTheme で使う型定義
export interface AppTheme {
  mode: 'light' | 'dark'; // モード判定用
  body: string;     // アプリ全体の背景（最も暗い色）
  panel: string;    // プロジェクトセクション等の背景（一段階明るい）
  item: string;     // タスク項目の背景
  itemHover: string;// タスク項目のホバー時
  text: string;     // メイン文字色
  subText: string;  // サブ文字色（薄いグレー）
  border: string;   // 境界線（控えめにする）
  accent: string;   // アクセントカラー
  
  // ★ 追加: 成功・警告などのシステムカラー
  success: string;  // 完了時の色（緑系だが彩度低め）
  danger: string;   // 削除ボタンなど（赤系）
}

// ベースとなるスレートグレーのパレット (Tailwind CSSのSlate系を参考に調整)
const colors = {
  slate950: '#020617', // ほぼ黒
  slate900: '#0f172a', // 非常に暗い青グレー
  slate800: '#1e293b', // 暗い青グレー
  slate700: '#334155', // 中間の青グレー
  slate600: '#475569',
  slate400: '#94a3b8', // 薄いグレー（サブテキスト）
  slate200: '#e2e8f0', // 白に近いグレー（メインテキスト）
  slate50:  '#f8fafc', // ほぼ白
};

// ライトモード（今回はダークメインですが一応定義）
export const lightThemeBase: Omit<AppTheme, 'accent'> = {
  mode: 'light',
  body: '#f1f5f9', // Slate-100
  panel: '#ffffff',
  item: '#ffffff',
  itemHover: '#f8fafc',
  text: '#0f172a',
  subText: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e',
  danger: '#ef4444',
};

// ★ ダークモード（Silent Tech 仕様）
export const darkThemeBase: Omit<AppTheme, 'accent'> = {
  mode: 'dark',
  // 漆黒ではなく、深いスレートグレーを使うことで「目に優しい」コントラストにする
  body: colors.slate950,  // 背景は最も深く
  panel: colors.slate900, // セクションは少し浮かせる
  item: 'transparent',    // タスクは背景に馴染ませる（または極薄く）
  itemHover: colors.slate800, // ホバーで明確に浮かせる
  text: colors.slate200,      // 真っ白(#fff)を使わず、少し落として目に優しく
  subText: colors.slate400,   // 情報の優先度を下げる
  border: colors.slate800,    // 境界線は背景に馴染ませる
  
  success: '#10b981', // Emerald-500 (目に優しい緑)
  danger: '#f43f5e',  // Rose-500
};

// アクセントカラー（テック感を出すため彩度を調整）
export const accentColors: { [key: string]: string } = {
  blue: '#3b82f6',   // Blue-500 (標準的で見やすい青)
  cyan: '#06b6d4',   // Cyan-500 (サイバー感)
  violet: '#8b5cf6', // Violet-500 (モダン)
  orange: '#f97316', // Orange-500
};

export const createTheme = (mode: 'dark' | 'light', accentName: string): AppTheme => {
  const baseTheme = mode === 'dark' ? darkThemeBase : lightThemeBase;
  const accentColor = accentColors[accentName] || accentColors.blue;
  
  return {
    ...baseTheme,
    accent: accentColor,
  };
};