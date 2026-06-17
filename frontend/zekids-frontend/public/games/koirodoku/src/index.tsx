import { render } from 'solid-js/web';
import './index.css';
import { createSignal } from 'solid-js';
import Board from './Board';
import Chooser from './Chooser';




const root = document.body.firstElementChild as HTMLDivElement;

function App() {
  const chooserState = createSignal(false);
  const [location, setLocation] = createSignal([0, 0]);


  const colors: string[] = ['pink', 'yellow', 'teal', 'blue'];

  return (
    <>
      <Board
        colors={colors}
        chooserState={chooserState}

        setLocation={setLocation}
      />
      <Chooser
        colors={colors}
        chooserState={chooserState}
        location={location}
      />
    </>
  );
}


render(App, root);
