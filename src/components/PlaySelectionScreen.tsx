import {ScreenType} from './ScreenType.tsx'

interface PlaySelectionProps{
    navigate : (target : ScreenType) => void
}

function PlaySelectionScreen( {navigate} : PlaySelectionProps ){
    return(
        <div className="screen-container">
            <h1 className="section-title">Choose Mode</h1>
            <div className="selection-grid">
            <div className="mode-card">
                <h2>Keyboard</h2>
                <button className="play-button" onClick={() => alert('Start Keyboard')}>Start</button>
            </div>
            <div className="mode-card">
                <h2>Hand Gesture</h2>
                <button className="play-button" onClick={() => alert('Start AI')}>Start</button>
            </div>
            </div>
            <button className="back-button" onClick={() => navigate(ScreenType.MAIN_MENU)}>Back</button>
        </div>
    )
}

export default PlaySelectionScreen;