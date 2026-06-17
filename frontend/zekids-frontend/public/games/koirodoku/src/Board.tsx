import { For, Setter, Signal } from "solid-js";
import { Cell } from "./Cell";



export default function Board(props: {
  colors: string[],
  chooserState: Signal<boolean>,
  setLocation: Setter<number[]>
}) {
  const [showChooser, setChooser] = props.chooserState;
  const [solvedTable, unsolvedTable] = generate4x4Sudoku();
  document.body.dataset.solver = solvedTable;


  return (
    <div class='board'>

      <For each={unsolvedTable}>
        {(row, ridx) => (
          <For each={row}>
            {(column, cidx) => (
              <Cell
                color={column === 0 ? 'empty' : props.colors[column - 1]}
                clickAction={function() {
                  if (column !== 0) return;
                  setChooser(!showChooser());
                  props.setLocation([ridx(), cidx()]);
                }}
              />
            )}
          </For>
        )}
      </For>

    </div>
  );
}

function generate4x4Sudoku(): [string, number[][]] {
  const fullBoard: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 4; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    // Corrected box constraint checking
    const boxRowStart = row - (row % 2);
    const boxColStart = col - (col % 2);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (board[boxRowStart + i][boxColStart + j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  const solveSudoku = (board: number[][], row: number, col: number): boolean => {
    if (col === 4) {
      col = 0;
      row++;
    }
    if (row === 4) {
      return true;
    }
    if (board[row][col] !== 0) {
      return solveSudoku(board, row, col + 1);
    }

    const numbers = [1, 2, 3, 4];
    shuffleArray(numbers);

    for (const num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudoku(board, row, col + 1)) {
          return true;
        }
        board[row][col] = 0;
      }
    }

    return false;
  };

  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  solveSudoku(fullBoard, 0, 0);


  const flattenedfullBoard = fullBoard.flat().map(_ => _.toString()).join('');

  // Randomly remove 8 cells from the board
  const emptyCells = 8;
  for (let i = 0; i < emptyCells; i++) {
    let row = Math.floor(Math.random() * 4);
    let col = Math.floor(Math.random() * 4);
    while (fullBoard[row][col] === 0) { // Ensure we don't overwrite an empty cell
      row = Math.floor(Math.random() * 4);
      col = Math.floor(Math.random() * 4);
    }
    fullBoard[row][col] = 0;
  }

  return [flattenedfullBoard, fullBoard];
}
