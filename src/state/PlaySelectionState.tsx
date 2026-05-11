import type { IAppState, AppContext} from "./IAppState";
import { ScreenType } from "../components/ScreenType";
import PlaySelectionScreen from "../components/PlaySelectionScreen.tsx";
import MainMenuState from "./MainMenuState";


class PlaySelectionState implements IAppState{
    readonly type = ScreenType.PLAY_SELECTION

    render(context : AppContext){
        return (
            <PlaySelectionScreen 
            navigate={(type) => {
            if (type === ScreenType.MAIN_MENU) context.changeState(new MainMenuState());
            
        }} 
            />
        )
    }
}

export default PlaySelectionState;