import React, {useState, useEffect} from 'react'
import type {IAppState, AppContext} from './state/IAppState.tsx'
import MainMenuState from './state/MainMenuState.tsx' 
import './styles.css'

const AnimatedBackground: React.FC = () => {
  return (
    <div className="background-wrapper">
      <div className="sky" />
      <div className="ground" />
      <div className="bird">
        <div className="bird-eye" />
        <div className="bird-wing" />
      </div>
    </div>
  );
};


function App(){
  const [currentState, setCurrentState] = useState<IAppState>(new MainMenuState())

  const context: AppContext = {
    changeState : (newState: IAppState) => setCurrentState(newState)
  };

  useEffect(() => {
    document.title = 'Sky Hopper - State Pattern';
  }, []);


  return (
    <div className="app-container">
      <AnimatedBackground />
      <div className="overlay">
        {/* Render dựa trên Object State hiện tại */}
        {currentState.render(context)}
      </div>
    </div>
  );
}

export default App;