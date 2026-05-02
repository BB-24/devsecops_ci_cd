import React, { useState } from 'react'
import './tick-tack-toe.css'

import o_icon from "../assets/o.png";
import x_icon from "../assets/x.png";

const TickTackToe = () => {

  const [board, setBoard] = useState(Array(9).fill(""));
  const [count, setCount] = useState(0);

  const checkWinner = () => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const winner = checkWinner();
  const isDraw = !winner && board.every((cell) => cell !== "");

  const handleClick = (index) => {
    if (winner || isDraw) return;
    if (board[index] !== "") return;

    const newBoard = [...board];
    newBoard[index] = count % 2 === 0 ? "x" : "o";

    setBoard(newBoard);
    setCount(count + 1);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(""));
    setCount(0);
  };

  return (
    <div className='container'>
      <h1 className='title'>
        {winner ? `${winner.toUpperCase()} Wins 🎉` : isDraw ? "It's a Draw!" : "Tick Tack Toe"}
      </h1>

      <div className='board'>
        {board.map((val, i) => (
          <div className="boxes" key={i} onClick={() => handleClick(i)}>
            {val === "x" && <img src={x_icon} alt="x" />}
            {val === "o" && <img src={o_icon} alt="o" />}
          </div>
        ))}
      </div>

      <button className="reset" onClick={handleReset}>Reset</button>
    </div>
  );
}

export default TickTackToe;