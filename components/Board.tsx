
import React from 'react';
import { BoardState, Player } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  validMoves: { row: number; col: number }[];
  currentPlayer: Player;
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, validMoves, currentPlayer, onCellClick }) => {
  const isHint = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="bg-green-700 p-2 rounded-lg shadow-2xl">
      <div className="grid grid-cols-8 grid-rows-8 gap-0.5 bg-green-900 border-2 border-green-900">
        {board.map((row, rowIndex) =>
          row.map((cellState, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="w-full h-full bg-green-600 aspect-square">
               <Cell
                state={cellState}
                isHint={isHint(rowIndex, colIndex)}
                currentPlayer={currentPlayer}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
