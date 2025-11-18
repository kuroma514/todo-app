// src/styled.d.ts
// (このファイルは新規作成です)
import 'styled-components';
import { AppTheme } from './themes'; // さっき作った AppTheme 型をインポート

declare module 'styled-components' {
  // DefaultTheme を AppTheme で上書きする
  export interface DefaultTheme extends AppTheme {}
}