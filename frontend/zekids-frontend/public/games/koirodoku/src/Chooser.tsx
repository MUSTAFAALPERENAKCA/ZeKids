import { Accessor, For, Signal } from 'solid-js';
import { Cell } from './Cell';

export default function Chooser(
  props: {
    colors: string[],
    chooserState: Signal<boolean>,
    location: Accessor<number[]>
  }) {
  const [showChooser, setChooser] = props.chooserState;

  return (

    <dialog open={showChooser()}>
      <For each={props.colors}>
        {(color) =>
          <Cell
            color={color}
            clickAction={
              function() {
                setChooser(!showChooser());
                const el = getCellFromLocation(props.location());
                el.className = color + ' editable';

                const emptyCells = document.getElementsByClassName('empty').length;

                if (emptyCells === 0)
                  if (winChecker())
                    alert('You Won!');

              }}
          />
        }
      </For>

    </dialog>
  );
}


const getCellFromLocation = (location: number[]): HTMLButtonElement => {
  const [row, column] = location;
  const id = column + (row * 4);
  return document.getElementsByTagName('button')[id] as HTMLButtonElement;

}


function winChecker(): boolean {
  const winboard = document.body.dataset.solver;
  const colors: string[] = ['pink', 'yellow', 'teal', 'blue'];
  const elements = document.getElementsByTagName('button');

  const colorlist = winboard!
    .split('')
    .map(s => colors[parseInt(s) - 1]);
  const won = colorlist.every((c, i) => elements[i].classList[0] === c);

  if (won)
    document.querySelectorAll('.editable').forEach(e => e.classList.remove('editable'))

  return won;
}
