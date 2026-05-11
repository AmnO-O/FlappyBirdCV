import type {IAppState, AppContext} from './IAppState.tsx'
import {ScreenType} from '../components/ScreenType.tsx'
import MainMenuScreen from '../components/MainMenuScreen.tsx'
import RankingState from './RankingState.tsx'
import PlaySelectionState from './RankingState.tsx'

class MainMenuState implements IAppState{
    readonly type = ScreenType.MAIN_MENU;

    render(context : AppContext){
        return(
            <MainMenuScreen
                navigate = {(type) => {
                    if (type === ScreenType.PLAY_SELECTION) context.changeState(new PlaySelectionState());
                    if (type === ScreenType.RANKING) context.changeState(new RankingState());
                }}
            />
        )
    }
}

export default MainMenuState;

