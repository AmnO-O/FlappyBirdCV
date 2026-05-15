import React, { useState, useEffect, useRef } from 'react';
import type { AppContext, IAppState } from './IAppState.tsx';
import { ScreenType } from '../components/ScreenType.tsx';
import { GameMode } from '../mode/GameMode.tsx';
import MainMenuState from './MainMenuState.tsx';

// Constants for physics
// Constants for physics
const GRAVITY = 0.26;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 4;
const PIPE_SPAWN_RATE = 1500; // ms
const BIRD_X = 50; // Horizontal position

interface PipeData {
 id: number;
 x: number;
 topHeight: number;
 passed: boolean;
 gap : number;
}

const GamePlayComponent: React.FC<{ mode: GameMode; onGameOver: () => void }> = ({ mode, onGameOver }) => {
 const [score, setScore] = useState(0);
 const [birdY, setBirdY] = useState(300);
 const [birdVelocity, setBirdVelocity] = useState(0);
 const [pipes, setPipes] = useState<PipeData[]>([]);
 const [countdown, setCountdown] = useState<number | null>(3);
 const [isGameOver, setIsGameOver] = useState(false);

 const requestRef = useRef<number>(0);
 const lastPipeSpawn = useRef<number>(0);

 // 1. Countdown Logic
 useEffect(() => {
  if (countdown === null) return;
  if (countdown > 0) {
   const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
   return () => clearTimeout(timer);
  } else {
   const timer = setTimeout(() => setCountdown(null), 500); // Brief delay at "Go!"
   return () => clearTimeout(timer);
  }
 }, [countdown]);

 // 2. Input Handling
 const jump = () => {
  if (countdown === null && !isGameOver) {
   setBirdVelocity(JUMP_STRENGTH);
  }
 };

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter' || e.code == 'W') jump();
  };

  if (mode === GameMode.KEYBOARD) {
   window.addEventListener('keydown', handleKeyDown);
  }
  
  // Placeholder for Hand Gesture logic
  if (mode === GameMode.HAND_GESTURE) {
    // Here you would listen to your Hand-Gesture detection hook
    // Example: gestureDetector.on('pinch', jump);
  }

  return () => window.removeEventListener('keydown', handleKeyDown);
 }, [mode, countdown, isGameOver]);

 // 3. Game Loop
 const update = (time: number) => {
  if (countdown !== null || isGameOver) return;

  // Update Bird
  setBirdY((y) => {
   const newY = y + birdVelocity;
   setBirdVelocity((v) => v + GRAVITY);
   
   // Ground/Ceiling Collision
   if (newY > window.innerHeight - 120 || newY < 0) {
    setIsGameOver(true);
   }
   return newY;
  });

  // Update Pipes
  setPipes((prevPipes) => {
   // Spawn new pipe
   if (time - lastPipeSpawn.current > PIPE_SPAWN_RATE) {
    const minGap = 250;
    const maxGap = 350;

    const randomGap = minGap + Math.random() * (maxGap - minGap);

    const newPipe: PipeData = {
     id: Date.now(),
     x: window.innerWidth,
     topHeight: 100 + Math.random() * 250,
     passed: false,
     gap: randomGap,
    };
    lastPipeSpawn.current = time;
    prevPipes.push(newPipe);
   }

   return prevPipes
    .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
    .filter((p) => p.x > -100); // Remove off-screen pipes
  });

  // Scoring and Collision
  pipes.forEach((pipe) => {
   // Score update
   if (!pipe.passed && pipe.x < BIRD_X) {
    pipe.passed = true;
    setScore((s) => s + 1);
   }

   // Hitbox Collision
   const birdRect = { top: birdY, bottom: birdY + 45, left: BIRD_X, right: BIRD_X + 60 };
   const pipeWidth = 90;
   const gapHeight = 170;

   if (
    birdRect.right > pipe.x &&
    birdRect.left < pipe.x + pipeWidth &&
    (birdRect.top < pipe.topHeight || birdRect.bottom > pipe.topHeight + gapHeight)
   ) {
    setIsGameOver(true);
   }
  });

  requestRef.current = requestAnimationFrame(update);
 };

 useEffect(() => {
  requestRef.current = requestAnimationFrame(update);
  return () => {
   if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };
 }, [countdown, isGameOver, birdVelocity, pipes]);

 return (
  <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
   {/* Score Display */}
   <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', color: 'white', fontSize: '4rem', fontWeight: 'bold', zIndex: 20, textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
    {score}
   </div>

   {/* Countdown Overlay */}
   {countdown !== null && (
    <div className="overlay">
     <h1 style={{ fontSize: '10rem', color: 'white' }}>{countdown === 0 ? 'GO!' : countdown}</h1>
    </div>
   )}

   {/* Game Over Overlay */}
   {isGameOver && (
    <div className="overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
     <div className="screen-container">
      <h1 className="section-title">GAME OVER</h1>
      <p className="subtitle">Final Score: {score}</p>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '15px' }}>
            <button className="play-button" onClick={() => window.location.reload()}>Try Again</button>
            <button className="back-button" onClick={onGameOver}>Main Menu</button>
        </div>
     </div>
    </div>
   )}

   {/* Bird */}
   <div 
    className="bird" 
    style={{ 
      top: birdY, 
      left: BIRD_X, 
      transform: `rotate(${birdVelocity * 3}deg)`,
      animation: 'none' // Disable the float animation during gameplay
    }}
   >
    <div className="bird-eye" />
    <div className="bird-wing" />
   </div>

   {/* Pipes */}
    {pipes.map((pipe) => (
        
    <div key={pipe.id} className="pipe-set" style={{ transform: `translateX(${pipe.x}px)`, animation: 'none' }}>
        
        <div className="pipe pipe-top" style={{ height: pipe.topHeight }} />
        
        
        <div className="pipe-gap" style={{ height: pipe.gap }} />
        
        
        <div className="pipe pipe-bottom" style={{ height: `calc(100vh - ${pipe.topHeight + pipe.gap}px)` }} />
    </div>
    ))}
  </div>
 );
};

export default class GameState implements IAppState {
 readonly type = ScreenType.GAME;
 mode: GameMode;
 
 constructor(mode: GameMode) {
  this.mode = mode;
 }

 render(context: AppContext) {
  return (
   <GamePlayComponent 
    mode={this.mode} 
    onGameOver={() => context.changeState(new MainMenuState())} 
   />
  );
 }
}

