import React, {useState, useEffect, useMemo} from 'react'
import type {IAppState, AppContext} from './state/IAppState.tsx'
import MainMenuState from './state/MainMenuState.tsx' 
import './styles.css'



const AnimatedAll: React.FC = () => {
  const pipes = useMemo(() => {
    return new Array(7).fill(0).map((_, index) => ({
      id: index,
      left: index * 260,
      topHeight: 100 + (index % 3) * 80,
    }));
  }, []);

  return (
    <div className="background-wrapper">
      <div className="sky" />

      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />

      {pipes.map((pipe) => (
        <div
          key={pipe.id}
          className="pipe-set"
          style={{ left: `${pipe.left}px` }}
        >
          <div
            className="pipe pipe-top"
            style={{ height: `${pipe.topHeight}px` }}
          />

          <div className="pipe-gap" />

          <div
            className="pipe pipe-bottom"
            style={{
              height: `${420 - pipe.topHeight}px`,
            }}
          />
        </div>
      ))}

      <div className="ground" />

      <div className="bird">
        <div className="bird-eye" />
        <div className="bird-wing" />
      </div>
    </div>
  );
};

const AnimatedBackground: React.FC = () => {

  return (
    <div className="background-wrapper">
      <div className="sky" />

      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />

      <div className="ground" />
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

  const isPlaying = (currentState as any).type === 'GAME';

  return (
    <div className="app-container">

      {!isPlaying ? <AnimatedAll /> : <AnimatedBackground />}

      <div className="overlay">
        {/* Render dựa trên Object State hiện tại */}
        {currentState.render(context)}
      </div>
    </div>
  );
}

export default App;