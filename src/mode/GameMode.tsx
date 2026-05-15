export const GameMode = {
    KEYBOARD: 'KEYBOARD',
    HAND_GESTURE: 'HAND_GESTURE',
} as const 

export type GameMode = (typeof GameMode)[keyof typeof GameMode];