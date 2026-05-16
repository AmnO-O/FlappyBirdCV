import type { AppContext, IAppState } from './IAppState.tsx';
import { ScreenType } from '../components/ScreenType.tsx';
import { GameMode } from '../mode/GameMode.tsx';
import MainMenuState from './MainMenuState.tsx';
import GamePlayScreen from '../components/GamePlayScreen.tsx'

class GameState implements IAppState{
  readonly type = ScreenType.GAME;
  mode: GameMode;

  constructor(mode : GameMode){
    this.mode = mode;
  }

  render(context : AppContext){
    return (
      <GamePlayScreen
        mode = {this.mode}
        onGameOver = {() => context.changeState(new MainMenuState())}
      />
    )
  } 
}


export default GameState;

