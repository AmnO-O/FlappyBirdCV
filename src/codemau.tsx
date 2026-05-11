// =========================================
// FILE: App.tsx
// =========================================

import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';

// =========================================
// ENUMS & TYPES
// =========================================

enum ScreenType {
  MAIN_MENU = 'MAIN_MENU',
  PLAY_SELECTION = 'PLAY_SELECTION',
  RANKING = 'RANKING',
}

enum InputMode {
  KEYBOARD_MOUSE = 'KEYBOARD_MOUSE',
  HAND_GESTURE = 'HAND_GESTURE',
}

interface ScreenProps {
  navigate: (screen: ScreenType) => void;
}

// =========================================
// STRATEGY PATTERN
// =========================================
// Different input handling strategies.

interface InputStrategy {
  getName(): string;
  getDescription(): string;
}

class KeyboardMouseStrategy implements InputStrategy {
  getName(): string {
    return 'Keyboard / Mouse';
  }

  getDescription(): string {
    return 'Classic and responsive controls using keyboard or mouse.';
  }
}

class HandGestureStrategy implements InputStrategy {
  getName(): string {
    return 'Hand Gesture';
  }

  getDescription(): string {
    return 'Control the game using AI-powered hand gestures.';
  }
}

// =========================================
// MOCK DATA
// =========================================

const rankings = [
  { name: 'Alex', score: 320 },
  { name: 'Sophia', score: 280 },
  { name: 'Daniel', score: 240 },
  { name: 'Emma', score: 210 },
  { name: 'Noah', score: 170 },
];

// =========================================
// BACKGROUND COMPONENT
// =========================================
// Flappy-bird-inspired moving background.

const AnimatedBackground: React.FC = () => {
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

// =========================================
// REUSABLE COMPONENTS
// =========================================

interface MenuButtonProps {
  title: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, onClick }) => {
  return (
    <button className="menu-button" onClick={onClick}>
      {title}
    </button>
  );
};

// =========================================
// MAIN MENU SCREEN
// =========================================

const MainMenuScreen: React.FC<ScreenProps> = ({ navigate }) => {
  return (
    <div className="screen-container">
      <h1 className="game-title">Sky Hopper</h1>

      <p className="subtitle">
        A modern flappy-style adventure game.
      </p>

      <div className="menu-group">
        <MenuButton
          title="Play Game"
          onClick={() => navigate(ScreenType.PLAY_SELECTION)}
        />

        <MenuButton
          title="Rankings"
          onClick={() => navigate(ScreenType.RANKING)}
        />
      </div>
    </div>
  );
};

// =========================================
// PLAY SELECTION SCREEN
// =========================================

const PlaySelectionScreen: React.FC<ScreenProps> = ({ navigate }) => {
  const keyboardStrategy = new KeyboardMouseStrategy();
  const handGestureStrategy = new HandGestureStrategy();

  const startGame = (mode: InputMode) => {
    alert(`Starting game using: ${mode}`);
  };

  return (
    <div className="screen-container">
      <h1 className="section-title">Choose Control Mode</h1>

      <div className="selection-grid">
        <div className="mode-card">
          <h2>{keyboardStrategy.getName()}</h2>

          <p>{keyboardStrategy.getDescription()}</p>

          <button
            className="play-button"
            onClick={() => startGame(InputMode.KEYBOARD_MOUSE)}
          >
            Start
          </button>
        </div>

        <div className="mode-card">
          <h2>{handGestureStrategy.getName()}</h2>

          <p>{handGestureStrategy.getDescription()}</p>

          <button
            className="play-button"
            onClick={() => startGame(InputMode.HAND_GESTURE)}
          >
            Start
          </button>
        </div>
      </div>

      <button
        className="back-button"
        onClick={() => navigate(ScreenType.MAIN_MENU)}
      >
        Back
      </button>
    </div>
  );
};

// =========================================
// RANKING SCREEN
// =========================================

const RankingScreen: React.FC<ScreenProps> = ({ navigate }) => {
  return (
    <div className="screen-container">
      <h1 className="section-title">Top Rankings</h1>

      <div className="ranking-board">
        {rankings.map((player, index) => (
          <div key={player.name} className="ranking-item">
            <span>#{index + 1}</span>
            <span>{player.name}</span>
            <span>{player.score}</span>
          </div>
        ))}
      </div>

      <button
        className="back-button"
        onClick={() => navigate(ScreenType.MAIN_MENU)}
      >
        Back
      </button>
    </div>
  );
};

// =========================================
// STATE PATTERN
// =========================================
// Each screen behaves like a state.

class ScreenFactory {
  static createScreen(
    screen: ScreenType,
    navigate: (screen: ScreenType) => void
  ) {
    switch (screen) {
      case ScreenType.PLAY_SELECTION:
        return <PlaySelectionScreen navigate={navigate} />;

      case ScreenType.RANKING:
        return <RankingScreen navigate={navigate} />;

      case ScreenType.MAIN_MENU:
      default:
        return <MainMenuScreen navigate={navigate} />;
    }
  }
}

// =========================================
// MAIN APP
// =========================================

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<ScreenType>(ScreenType.MAIN_MENU);

  useEffect(() => {
    document.title = 'Sky Hopper';
  }, []);

  return (
    <div className="app-container">
      <AnimatedBackground />

      <div className="overlay">
        {ScreenFactory.createScreen(currentScreen, setCurrentScreen)}
      </div>
    </div>
  );
}

// =========================================
// FILE: styles.css
// =========================================

/* RESET */