import { useState } from "react";
import './App.css'
import TickTackToe from "./components/tick-tack-toe/tick-tack-toe";

function App() {
  const [reset, setReset] = useState(false);

  return (
    <div>
      <TickTackToe reset={reset} setReset={setReset} />

    </div>
  );
}

export default App
