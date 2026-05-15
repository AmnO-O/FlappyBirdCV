import {ScreenType} from './ScreenType.tsx'
import { GameMode } from '../mode/GameMode.tsx';
interface PlaySelectionProps{
    navigate : (target : ScreenType, mode : GameMode) => void
}

function PlaySelectionScreen( {navigate} : PlaySelectionProps ){
    return(
        <div className="screen-container">
            <h1 className="section-title">Choose Mode</h1>
            <div className="selection-grid">
            <div className="mode-card">
                <h2>Keyboard</h2>
                <button className="play-button" onClick={() => navigate(ScreenType.GAME, GameMode.KEYBOARD)}>Start</button>
            </div>
            <div className="mode-card">
                <h2>Hand Gesture</h2>
                <button className="play-button" onClick={() => navigate(ScreenType.GAME, GameMode.HAND_GESTURE)}>Start</button>
            </div>
            </div>
            <button className="back-button" onClick={() => navigate(ScreenType.MAIN_MENU, GameMode.KEYBOARD)}>Back</button>
        </div>
    )
}

export default PlaySelectionScreen;