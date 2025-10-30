import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import { BoardState, CellState, Player, Score } from './types';
import { BOARD_SIZE, PLAYERS } from './constants';

const App: React.FC = () => {
  const createInitialBoard = (): BoardState => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CellState.EMPTY));
    const mid = BOARD_SIZE / 2;
    board[mid - 1][mid - 1] = CellState.WHITE;
    board[mid - 1][mid] = CellState.BLACK;
    board[mid][mid - 1] = CellState.BLACK;
    board[mid][mid] = CellState.WHITE;
    return board;
  };

  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.BLACK);
  const [scores, setScores] = useState<Score>({ [Player.BLACK]: 2, [Player.WHITE]: 2 });
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const getFlips = useCallback((boardState: BoardState, row: number, col: number, player: Player): { row: number, col: number }[] => {
    if (boardState[row][col] !== CellState.EMPTY) {
      return [];
    }
  
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    const directions = [
      { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
      { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 },
    ];
  
    const flips: { row: number, col: number }[] = [];
  
    for (const dir of directions) {
      let r = row + dir.r;
      let c = col + dir.c;
      const potentialFlips: { row: number, col: number }[] = [];
  
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        // Fix: Cast CellState to Player for comparison to resolve the type overlap error.
        if ((boardState[r][c] as Player) === opponent) {
          potentialFlips.push({ row: r, col: c });
        // Fix: Cast CellState to Player for comparison to resolve the type overlap error.
        } else if ((boardState[r][c] as Player) === player) {
          flips.push(...potentialFlips);
          break;
        } else {
          break;
        }
        r += dir.r;
        c += dir.c;
      }
    }
    return flips;
  }, []);
  
  const calculateValidMoves = useCallback((boardState: BoardState, player: Player): { row: number; col: number }[] => {
    const moves: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (boardState[r][c] === CellState.EMPTY) {
          if (getFlips(boardState, r, c, player).length > 0) {
            moves.push({ row: r, col: c });
          }
        }
      }
    }
    return moves;
  }, [getFlips]);


  useEffect(() => {
    if (gameOver) return;

    const newValidMoves = calculateValidMoves(board, currentPlayer);
    setValidMoves(newValidMoves);

    const opponent = currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
    const opponentValidMoves = calculateValidMoves(board, opponent);

    if (newValidMoves.length === 0 && opponentValidMoves.length === 0) {
      setGameOver(true);
      if (scores[Player.BLACK] > scores[Player.WHITE]) setWinner(Player.BLACK);
      else if (scores[Player.WHITE] > scores[Player.BLACK]) setWinner(Player.WHITE);
      else setWinner(null);
    } else if (newValidMoves.length === 0) {
      setCurrentPlayer(opponent);
    }
  }, [board, currentPlayer, scores, gameOver, calculateValidMoves]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || !validMoves.some(move => move.row === row && move.col === col)) {
      return;
    }

    const newBoard = board.map(r => [...r]);
    const flips = getFlips(board, row, col, currentPlayer);

    newBoard[row][col] = currentPlayer;
    flips.forEach(flip => {
      newBoard[flip.row][flip.col] = currentPlayer;
    });

    let blackScore = 0;
    let whiteScore = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === Player.BLACK) blackScore++;
        if (newBoard[r][c] === Player.WHITE) whiteScore++;
      }
    }
    
    setBoard(newBoard);
    setScores({ [Player.BLACK]: blackScore, [Player.WHITE]: whiteScore });
    setCurrentPlayer(currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK);
  };

  const handleNewGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer(Player.BLACK);
    setScores({ [Player.BLACK]: 2, [Player.WHITE]: 2 });
    setGameOver(false);
    setWinner(null);
  };

  const renderStatus = () => {
    if (gameOver) {
      if (winner) {
        return <h2 className="text-2xl font-bold text-yellow-400">{PLAYERS[winner].name} Wins!</h2>;
      }
      return <h2 className="text-2xl font-bold text-gray-300">It's a Draw!</h2>;
    }
    const playerConfig = PLAYERS[currentPlayer];
    return (
      <div className="flex items-center space-x-3">
        <h2 className="text-2xl font-bold">Current Turn:</h2>
        <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full ${playerConfig.colorClass} border-2 border-gray-400`}></span>
            <span className="text-2xl font-semibold">{playerConfig.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4 font-sans">
      <header className="mb-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">Othello</h1>
        <p className="text-gray-400">A game of strategy</p>
      </header>
      
      <div className="w-full max-w-md lg:max-w-4xl flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <main className="w-full max-w-md mx-auto">
          <Board 
            board={board}
            validMoves={validMoves}
            currentPlayer={currentPlayer}
            onCellClick={handleCellClick}
          />
        </main>

        <aside className="w-full lg:w-64 bg-gray-700/50 p-6 rounded-lg shadow-xl flex flex-col space-y-6">
          <div className="text-center">
            {renderStatus()}
          </div>
          
          <div className="flex justify-around items-center text-center text-lg font-semibold">
            <div className="flex flex-col items-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-black border-2 border-gray-500"></span>
              <span className="text-3xl">{scores[Player.BLACK]}</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-white border-2 border-gray-500"></span>
              <span className="text-3xl">{scores[Player.WHITE]}</span>
            </div>
          </div>
          
          <button 
            onClick={handleNewGame} 
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-bold transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          >
            New Game
          </button>
        </aside>
      </div>

       <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Built by a world-class senior frontend React engineer.</p>
      </footer>
    </div>
  );
};

export default App;
