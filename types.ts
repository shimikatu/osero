
export enum Player {
  BLACK = 1,
  WHITE = 2,
}

export enum CellState {
  EMPTY = 0,
  BLACK = Player.BLACK,
  WHITE = Player.WHITE,
}

export type BoardState = CellState[][];

export type Score = {
  [Player.BLACK]: number;
  [Player.WHITE]: number;
};
