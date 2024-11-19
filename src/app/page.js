'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';


const FishDesigns = [
  // Original Goldfish
  {
    body: "from-orange-400 to-yellow-300",
    tail: "bg-orange-400",
    fin: "bg-orange-400",
    eyeSize: 30, // Tamaño del ojo en porcentaje
    eyePosition: { top: '35%', left: '50%' }, // Posición del ojo
    shadow: "shadow-orange-500/50",
    scale: "scale-100"
  },
  // Tropical Blue
  {
    body: "from-blue-400 to-sky-300",
    tail: "bg-blue-400",
    fin: "bg-blue-400",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-blue-500/50",
    scale: "scale-110"
  },
  // Royal Purple
  {
    body: "from-purple-400 to-pink-300",
    tail: "bg-purple-400",
    fin: "bg-purple-400",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-purple-500/50",
    scale: "scale-95"
  },
  // Neon Green
  {
    body: "from-green-400 to-emerald-300",
    tail: "bg-green-400",
    fin: "bg-green-400",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-green-500/50",
    scale: "scale-105"
  },
  // Cherry Red
  {
    body: "from-red-400 to-rose-300",
    tail: "bg-red-400",
    fin: "bg-red-400",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-red-500/50",
    scale: "scale-100"
  },
  // Rainbow Fish
  {
    body: "from-indigo-400 via-purple-400 to-pink-400",
    tail: "bg-gradient-to-br from-purple-400 to-pink-400",
    fin: "bg-gradient-to-br from-indigo-400 to-purple-400",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-purple-500/50",
    scale: "scale-115"
  },
  // Deep Sea Fish
  {
    body: "from-slate-700 to-slate-500",
    tail: "bg-slate-600",
    fin: "bg-slate-600",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-slate-500/50",
    scale: "scale-120"
  },
  // Golden Koi
  {
    body: "from-yellow-500 via-yellow-300 to-white",
    tail: "bg-gradient-to-br from-yellow-500 to-yellow-300",
    fin: "bg-gradient-to-br from-yellow-500 to-yellow-300",
    eyeSize: 30,
    eyePosition: { top: '35%', left: '50%' },
    shadow: "shadow-yellow-500/50",
    scale: "scale-110"
  }
];

const DIFFICULTY_SETTINGS = {
  easy: {
    gravity: 0.4,
    pipeGap: 180,
    gameSpeed: 2,
    jumpForce: -7,
    label: "Easy"
  },
  medium: {
    gravity: 0.5,
    pipeGap: 150,
    gameSpeed: 3,
    jumpForce: -8,
    label: "Normal"
  },
  hard: {
    gravity: 0.6,
    pipeGap: 130,
    gameSpeed: 4,
    jumpForce: -9,
    label: "Hard"
  }
};

const DifficultySelector = ({ onSelect }) => {
  const defaultGradient = "from-blue-400 to-purple-400";
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${defaultGradient} mb-8`}>
        Select Difficulty
      </div>
      <div className="flex flex-col gap-4">
        {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
          <button
            key={key}
            className={`px-8 py-4 bg-gradient-to-r ${defaultGradient} text-white rounded-lg font-bold
              shadow-lg shadow-purple-500/50 
              hover:brightness-110 transform hover:scale-105 transition-all min-w-[200px]
              relative overflow-hidden group`}
            onClick={() => onSelect(key)}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            {settings.label}
            <div className="text-sm opacity-75 mt-1">
              {key === 'easy' && '(Large spaces, low speed)'}
              {key === 'medium' && '(Medium spaces, medium speed)'}
              {key === 'hard' && '(Small spaces, high speed)'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
let jumpSound
const FlappyFish = () => {
  const gameOverSound = useRef(null);
  useEffect(() => {
    // Inicializar el sonido
    jumpSound = new Howl({
      src: ['Jump.mp3'],
      volume: 0.5,
    });
  }, []);
  
  useEffect(() => {
    // Inicializar los objetos de sonido
    gameOverSound.current = new Audio('gameOver.mp3');

    // Opcional: ajustar el volumen
    gameOverSound.current.volume = 0.5;
  }, []);

  const containerWidth = 480;
  const containerHeight = 480;
  const [fishPosition, setFishPosition] = useState(containerHeight / 2);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [currentFish, setCurrentFish] = useState(FishDesigns[Math.floor(Math.random() * FishDesigns.length)]);
  const [difficulty, setDifficulty] = useState(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [pipes, setPipes] = useState([]);

  const fishSize = 40;
  const pipeWidth = 60;

  // Funciones auxiliares para convertir píxeles a porcentajes
  const toPercentWidth = (value) => (value / containerWidth) * 100;
  const toPercentHeight = (value) => (value / containerHeight) * 100;

  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(DIFFICULTY_SETTINGS[selectedDifficulty]);
    setShowDifficultySelector(false);
  };



  const handleJump = useCallback(() => {
    if (!gameOver && difficulty && !showDifficultySelector) {
      setVelocity(difficulty.jumpForce);
      if (!gameHasStarted) {
        setGameHasStarted(true);
      }

      // Reproducir el sonido
      jumpSound.play();
    }
  }, [gameOver, gameHasStarted, difficulty, showDifficultySelector]);


  const resetGame = () => {
    setFishPosition(containerHeight / 2);
    setGameHasStarted(false);
    setScore(0);
    setGameOver(false);
    setVelocity(0);
    setPipes([]);
    setCurrentFish(FishDesigns[Math.floor(Math.random() * FishDesigns.length)]);
    setShowDifficultySelector(true);
    setDifficulty(null);
  };

  useEffect(() => {
    if (gameOver) {
      // Reproducir sonido de fin del juego
      if (gameOverSound.current) {
        gameOverSound.current.currentTime = 1.5;
        gameOverSound.current.play().catch((error) => {
          console.error('Error al reproducir el sonido de fin del juego:', error);
        });
        setTimeout(() => {
          gameOverSound.current.pause();
        }, 2000);
      }
    }
  }, [gameOver]);

  useEffect(() => {
    let gameLoop;
    
    if (gameHasStarted && !gameOver && difficulty) {
      gameLoop = setInterval(() => {
        setFishPosition(pos => {
          const newPos = pos + velocity;
          if (newPos < 0 || newPos > containerHeight - fishSize) {
            setGameOver(true);
            return pos;
          }
          return newPos;
        });
        
        setVelocity(v => v + difficulty.gravity);
        
        setPipes(currentPipes => {
          let newPipes = currentPipes
            .map(pipe => ({ ...pipe, x: pipe.x - difficulty.gameSpeed }))
            .filter(pipe => pipe.x > -pipeWidth);
            
          if (currentPipes.length === 0 || currentPipes[currentPipes.length - 1].x < containerWidth - 200) {
            const heightRange = containerHeight - (difficulty.pipeGap + 100);
            const minHeight = 50;
            const height = Math.random() * heightRange + minHeight;
            newPipes.push({ x: containerWidth, height });
          }
          
          newPipes.forEach(pipe => {
            const fishLeft = 100;
            const fishRight = fishLeft + fishSize;
            const fishTop = fishPosition;
            const fishBottom = fishPosition + fishSize;
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + pipeWidth;
            const pipeTopHeight = pipe.height;
            const pipeBottomY = pipe.height + difficulty.pipeGap;

            if (
              fishRight > pipeLeft &&
              fishLeft < pipeRight &&
              (fishTop < pipeTopHeight || fishBottom > pipeBottomY)
            ) {
              setGameOver(true);
            }

            if (pipe.x + pipeWidth < fishLeft && !pipe.passed) {
              setScore(s => s + 1);
              pipe.passed = true;
            }
          });
          
          return newPipes;
        });
      }, 20);
    }
    
    return () => {
      if (gameLoop) clearInterval(gameLoop);
    };
  }, [gameHasStarted, gameOver, velocity, fishPosition, difficulty]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleJump]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
        Flappy Fish
      </h1>
      <div 
        className="relative w-full max-w-[480px] aspect-square bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 overflow-hidden cursor-pointer rounded-lg shadow-2xl border border-blue-500"
        onClick={handleJump}
      >
        {/* Fondo de burbujas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${8 + Math.random() * 7}s linear infinite`,
              }}
            />
          ))}
        </div>

        {/* Pez */}
        {!showDifficultySelector && (
          <div
            className={`absolute transition-transform duration-200 ${currentFish.scale}`}
            style={{ 
              top: `${toPercentHeight(fishPosition)}%`,
              left: `${toPercentWidth(100)}%`,
              width: `${toPercentWidth(fishSize)}%`,
              height: `${toPercentHeight(fishSize)}%`,
              transform: `rotate(${velocity * 3}deg) ${velocity > 0 ? 'scaleY(0.95)' : 'scaleY(1.05)'}`,
            }}
          >
            <div className="relative w-full h-full">
              {/* Cuerpo del pez */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentFish.body} rounded-full shadow-lg ${currentFish.shadow}`} />

              {/* Cola del pez */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] h-[60%]">
                <div className={`w-full h-full ${currentFish.tail} rotate-45 transform origin-left`} />
              </div>

              {/* Ojo del pez */}
              <div
                className={`absolute  bg-white rounded-full `}
                style={{
                  width: `${currentFish.eyeSize}%`,
                  height: `${currentFish.eyeSize}%`,
                  top: currentFish.eyePosition.top,
                  left: currentFish.eyePosition.left,
                }}
              >
                <div className="absolute w-[40%] h-[40%] bg-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Aleta del pez */}
              <div className={`absolute w-[25%] h-[20%] ${currentFish.fin} rounded-full top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
            </div>
          </div>
        )}
        
        {/* Tuberías */}
        {!showDifficultySelector && pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Tubería superior */}
            <div
              className="absolute bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-b-lg shadow-lg"
              style={{
                left: `${toPercentWidth(pipe.x)}%`,
                width: `${toPercentWidth(pipeWidth)}%`,
                height: `${toPercentHeight(pipe.height)}%`,
                top: 0,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="absolute inset-0 opacity-20">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1/3 h-full bg-emerald-400"
                    style={{ left: `${i * 33.33}%` }}
                  />
                ))}
              </div>
            </div>
            {/* Tubería inferior */}
            <div
              className="absolute bg-gradient-to-t from-emerald-600 to-emerald-800 rounded-t-lg shadow-lg"
              style={{
                left: `${toPercentWidth(pipe.x)}%`,
                width: `${toPercentWidth(pipeWidth)}%`,
                height: `${toPercentHeight(containerHeight - pipe.height - (difficulty?.pipeGap || 150))}%`,
                top: `${toPercentHeight(pipe.height + (difficulty?.pipeGap || 150))}%`,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="absolute inset-0 opacity-20">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1/3 h-full bg-emerald-400"
                    style={{ left: `${i * 33.33}%` }}
                  />
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
        
        {/* Puntuación */}
        {!showDifficultySelector && (
          <div className={`absolute left-[46%] top-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentFish.body} animate-pulse`}>
            {score}
          </div>
        )}
        
        {/* Selector de Dificultad */}
        {showDifficultySelector && (
          <DifficultySelector onSelect={handleDifficultySelect} />
        )}
        
        {/* Mensaje de inicio */}
        {!gameHasStarted && !gameOver && !showDifficultySelector && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentFish.body} text-center animate-pulse`}>
              Click or press space<br />to swim
            </div>
          </div>
        )}
        
        {/* Pantalla de Game Over */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentFish.body} mb-4`}>
              ¡GAME OVER!
            </div>
            <div className="text-xl text-blue-300 mb-4">
              Score: {score}
            </div>
            <button
              className={`px-6 py-3 bg-gradient-to-r ${currentFish.body} text-white rounded-full font-bold ${currentFish.shadow} hover:brightness-110 transform hover:scale-105 transition-all`}
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
            >
              Swim Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-20px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FlappyFish;