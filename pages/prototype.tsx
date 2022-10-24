import { Chess } from "chess.js";

import { css } from '@emotion/react'

import styles from '../components/chessboard/prototype.module.css'

import React, { MouseEvent, useRef } from 'react';

interface ChessBoardProps {
    board: Chess;
    isPlayerWhite: boolean;
    selection: string;
    setSelection(selection: string): void;
}


// they use special presets to determine positiions on board. transform is hardcoded




function piece_url(piece: string, color: string) {

    let copy = color.toLowerCase() + piece.toUpperCase();

    console.log(copy);

    return `https://dylanleclair.ca/pieces/${copy}.svg`
}

function Piece(i: number, j: number, piece: string, color: string) {
    return (<div className={styles.piece} css={css`transform: translate(${j * 100}%, ${i * 100}%); background-image: url(${piece_url(piece, color)});`}></div>)
}





function windowToBoardCoords(canvas: HTMLDivElement, windowCoords: Position): Position {
    const boundingRect = canvas.getBoundingClientRect();

    return { x: windowCoords.x - boundingRect.left, y: windowCoords.y - boundingRect.top };
}


function getMousePos(boardRef: React.MutableRefObject<HTMLDivElement>, event: MouseEvent) {

    const r = windowToBoardCoords(boardRef.current!, { x: event.clientX, y: event.clientY })

    console.log(r);
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

    let chess = new Chess();
    let board = chess.board();



    let pieces = []
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let piece = board[i][j];
            if (piece) {
                pieces.push(Piece(i, j, piece.type, piece.color))
            }
        }
    }


    return (
        <div id="contiainer">

            <div ref={boardRef} className={styles.chessboard} css={css``} onMouseDown={mouseDown} >

                {pieces && pieces}

            </div>
        </div >
    )

}