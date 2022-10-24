import { Chess } from "chess.js";

import { css } from '@emotion/react'

import styles from './prototype.module.css'

import React, { MouseEvent, useRef } from 'react';


interface Position {
  x: number;
  y: number;
}

interface ChessBoardProps {
  board: Chess;
  isPlayerWhite: boolean;
  selection: string;
  setSelection(selection: string): void;
}


// they use special presets to determine positiions on board. transform is hardcoded


const FILES = "abcdefgh"


function piece_url(piece: string, color: string) {

  let copy = color.toLowerCase() + piece.toUpperCase();


  return `https://dylanleclair.ca/pieces/${copy}.svg`
}

function Piece(i: number, j: number, piece: string, color: string) {
  return (<div key={((j * 8) + i)} className={styles.piece} css={css`transform: translate(${j * 100}%, ${i * 100}%); background-image: url(${piece_url(piece, color)});`}></div>)
}



function Labels() {
  return (
    <div>
      <svg viewBox="0 0 100 100" className="coordinates"><text x="0.75" y="3.5" font-size="2.8" className={styles.coordinatelight}>8</text><text x="0.75" y="15.75" font-size="2.8" className={styles.coordinatedark}>7</text><text x="0.75" y="28.25" font-size="2.8" className={styles.coordinatelight}>6</text><text x="0.75" y="40.75" font-size="2.8" className={styles.coordinatedark}>5</text><text x="0.75" y="53.25" font-size="2.8" className={styles.coordinatelight}>4</text><text x="0.75" y="65.75" font-size="2.8" className={styles.coordinatedark}>3</text><text x="0.75" y="78.25" font-size="2.8" className={styles.coordinatelight}>2</text><text x="0.75" y="90.75" font-size="2.8" className={styles.coordinatedark}>1</text><text x="10" y="99" font-size="2.8" className={styles.coordinatedark}>a</text><text x="22.5" y="99" font-size="2.8" className={styles.coordinatelight}>b</text><text x="35" y="99" font-size="2.8" className={styles.coordinatedark}>c</text><text x="47.5" y="99" font-size="2.8" className={styles.coordinatelight}>d</text><text x="60" y="99" font-size="2.8" className={styles.coordinatedark}>e</text><text x="72.5" y="99" font-size="2.8" className={styles.coordinatelight}>f</text><text x="85" y="99" font-size="2.8" className={styles.coordinatedark}>g</text><text x="97.5" y="99" font-size="2.8" className={styles.coordinatelight}>h</text></svg>
    </div>)
}





function windowToBoardCoords(canvas: HTMLDivElement, windowCoords: Position): Position {
  const boundingRect = canvas.getBoundingClientRect();

  return { x: windowCoords.x - boundingRect.left, y: windowCoords.y - boundingRect.top };
}


function getMousePos(boardRef: React.MutableRefObject<HTMLDivElement>, event: MouseEvent) {

  const r = windowToBoardCoords(boardRef.current!, { x: event.clientX, y: event.clientY })

}


function mouseDown(event: MouseEvent) {

  console.log("pos: " + event.clientX + " " + event.clientY)
}

function mouseMove(event: MouseEvent) {

}

function mouseUp(event: MouseEvent) {

}

export default function NewBoard(props: ChessBoardProps) {

  const boardRef = useRef<HTMLDivElement>(null);

  let pieces = []
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = props.board.board()[i][j];
      if (piece) {
        pieces.push(Piece(i, j, piece.type, piece.color))
      }
    }
  }

  return (
    <div id="contiainer">

      <div ref={boardRef} className={styles.chessboard} css={css``} onMouseDown={mouseDown} >

        {pieces && pieces}

        <Labels />

      </div>
    </div >
  )

}