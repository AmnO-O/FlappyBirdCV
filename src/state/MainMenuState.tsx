import type {IAppState, AppContext} from './IAppState.tsx'
import {ScreenType} from '../components/ScreenType.tsx'
import MainMenuScreen from '../components/MainMenuScreen.tsx'
import RankingState from './RankingState.tsx'
import PlaySelectionState from './PlaySelectionState.tsx'

class MainMenuState implements IAppState{
    readonly type = ScreenType.MAIN_MENU;

    render(context : AppContext){
        return(
            <MainMenuScreen
                navigate = {(type) => {
                    if (type === ScreenType.PLAY_SELECTION) context.changeState(new PlaySelectionState());
                    else if (type === ScreenType.RANKING) context.changeState(new RankingState());
                    else console.warn("Unknown navigation type:", type);
                }}
            />
        )
    }
}

export default MainMenuState;

