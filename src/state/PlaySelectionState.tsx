import type { IAppState, AppContext} from "./IAppState";
import { ScreenType } from "../components/ScreenType";
import PlaySelectionScreen from "../components/PlaySelectionScreen.tsx";
import MainMenuState from "./MainMenuState";
import { GameMode } from "../mode/GameMode";
import GameState from "./GameState";

class PlaySelectionState implements IAppState{
    readonly type = ScreenType.PLAY_SELECTION

    render(context : AppContext){
        return (
            <PlaySelectionScreen 
            navigate={(type, mode) => {
            if (type === ScreenType.MAIN_MENU) context.changeState(new MainMenuState());
            else if (type == ScreenType.GAME){
                context.changeState(new GameState(mode  || GameMode.KEYBOARD));  
            }
        }} 
            />
        )
    }
}

export default PlaySelectionState;