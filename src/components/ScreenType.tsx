// Sử dụng const object thay cho enum
export const ScreenType = {
  MAIN_MENU: 'MAIN_MENU',
  PLAY_SELECTION: 'PLAY_SELECTION',
  RANKING: 'RANKING',
  GAME: 'GAME',
} as const;

export type ScreenType = (typeof ScreenType)[keyof typeof ScreenType];