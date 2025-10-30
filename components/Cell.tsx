
import React from 'react';
import { CellState, Player } from '../types';
import { PLAYERS } from '../constants';

interface CellProps {
  state: CellState;
  isHint: boolean;
  currentPlayer: Player;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ state, isHint, currentPlayer, onClick }) => {
  const cellContent = () => {
    if (state !== CellState.EMPTY) {
      const playerConfig = state === CellState.BLACK ? PLAYERS[Player.BLACK] : PLAYERS[Player.WHITE];
      return (
        <div className={`w-full h-full rounded-full ${playerConfig.colorClass} transform transition-transform duration-300 scale-90`}></div>
      );
    }
    if (isHint) {
      const hintColor = currentPlayer === Player.BLACK ? 'bg-black/40' : 'bg-white/40';
      return (
        <div className={`w-full h-full rounded-full ${hintColor} transform transition-transform duration-200 scale-50`}></div>
      );
    }
    return null;
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      {cellContent()}
    </div>
  );
};

export default Cell;
