import  { ScreenType } from './ScreenType.tsx'

interface MainMenuProps{
    navigate: (target: ScreenType) => void;
}

function MainMenuScreen({navigate} : MainMenuProps){
    return (
    <div className="screen-container">
        <h1 className="game-title">Sky Hopper</h1>
        <div className="menu-group">
        <button className="menu-button" onClick={() => navigate(ScreenType.PLAY_SELECTION)}>Play Game</button>
        <button className="menu-button" onClick={() => navigate(ScreenType.RANKING)}>Rankings</button>
        </div>
    </div>
    );
}

export default MainMenuScreen;