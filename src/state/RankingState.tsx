import type {IAppState, AppContext} from './IAppState.tsx'
import {ScreenType} from '../components/ScreenType.tsx'
import RankingScreen from '../components/RankingScreen.tsx'
import MainMenuState from './MainMenuState.tsx'

class RankingState implements IAppState{
    readonly type = ScreenType.RANKING;

    render(context: AppContext){
        return (
            <RankingScreen 
                navigate = {(type) => {
                    if(type == ScreenType.MAIN_MENU) context.changeState(new MainMenuState())
                }}
            />
        );
    }
}

export default RankingState;