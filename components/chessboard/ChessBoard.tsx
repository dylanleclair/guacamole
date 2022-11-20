import { Chess, Move } from "chess.js";

import { css } from "@emotion/react";

import styles from "./prototype.module.css";

import React, { MouseEvent, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

interface ColorScheme {
  light?: string;
  dark?: string;
}

interface ChessBoardProps {
  board: Chess;
  isPlayerWhite: boolean;
  colorScheme?: ColorScheme;
  selection: string;
  setSelection(selection: string): void;
}

// they use special presets to determine positiions on board. transform is hardcoded

const FILES = "abcdefgh";

function convertIndicesToBoardNotation(pos: { i: number; j: number }) {
  let result: string = `${FILES[pos.i]}${8 - pos.j}`;
  return result;
}

function boardNotationToIndices(pos: string) {
  if (pos.length != 2) {
    throw Error("Input string invalid (wrong size).");
  }

  //  (a8) -> index 0
  //  (a7)
  //  (a6)
  //  (a1) -> index 7

  let x = 0;
  for (let i = 0; i < FILES.length; i++) {
    if (FILES[i] == pos[0]) {
      x = i;
    }
  }

  return { x: x, y: Math.abs(Number.parseInt(pos[1]) - 8) };
}

/** Calculates the possible moves for the selected piece, returning an SVG rendering them all as an overlay on the board. */
function getPossibleMoves(selection: string, position: Chess) {
  let moves = position.moves({ verbose: true }) as Move[];

  let movesDrawn = moves
    .filter((move) => move.from === selection)
    .map((move) => {
      let pos = boardNotationToIndices(move.to);

      return (
        <div
          key={pos.x * 8 + pos.y}
          className={styles.piece}
          css={css`
            transform: translate(${pos.x * 100}%, ${pos.y * 100}%);
          `}
        >
          <div
            className={styles.potentialMoves}
            css={css`
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: 50%;
            `}
          ></div>
        </div>
      );
    });

  return movesDrawn;
}

function piece_url(piece: string, color: string) {
  let copy = color.toLowerCase() + piece.toUpperCase();

  return `https://dylanleclair.ca/pieces/${copy}.svg`;
}

function Piece(i: number, j: number, piece: string, color: string) {
  return (
    <div
      key={j * 8 + i}
      className={styles.piece}
      css={css`
        transform: translate(${j * 100}%, ${i * 100}%);
        background-image: url(${piece_url(piece, color)});
      `}
    ></div>
  );
}

function Labels(props: ColorScheme) {
  const light = props.light;
  const dark = props.dark;
  return (
    <div className={styles.labels}>
      <svg viewBox="0 0 100 100">
        <text x="0.75" y="3.5" font-size="2.8" fill={light}>
          8
        </text>
        <text x="0.75" y="15.75" font-size="2.8" fill={dark}>
          7
        </text>
        <text x="0.75" y="28.25" font-size="2.8" fill={light}>
          6
        </text>
        <text x="0.75" y="40.75" font-size="2.8" fill={dark}>
          5
        </text>
        <text x="0.75" y="53.25" font-size="2.8" fill={light}>
          4
        </text>
        <text x="0.75" y="65.75" font-size="2.8" fill={dark}>
          3
        </text>
        <text x="0.75" y="78.25" font-size="2.8" fill={light}>
          2
        </text>
        <text x="0.75" y="90.75" font-size="2.8" fill={dark}>
          1
        </text>
        <text x="10" y="99" font-size="2.8" fill={dark}>
          a
        </text>
        <text x="22.5" y="99" font-size="2.8" fill={light}>
          b
        </text>
        <text x="35" y="99" font-size="2.8" fill={dark}>
          c
        </text>
        <text x="47.5" y="99" font-size="2.8" fill={light}>
          d
        </text>
        <text x="60" y="99" font-size="2.8" fill={dark}>
          e
        </text>
        <text x="72.5" y="99" font-size="2.8" fill={light}>
          f
        </text>
        <text x="85" y="99" font-size="2.8" fill={dark}>
          g
        </text>
        <text x="97.5" y="99" font-size="2.8" fill={light}>
          h
        </text>
      </svg>
    </div>
  );
}

function windowToBoardCoords(
  canvas: HTMLDivElement,
  windowCoords: Position
): Position {
  const boundingRect = canvas.getBoundingClientRect();

  return {
    x: windowCoords.x - boundingRect.left,
    y: windowCoords.y - boundingRect.top,
  };
}

function getMousePos(
  boardRef: React.MutableRefObject<HTMLDivElement>,
  event: MouseEvent
) {
  const r = windowToBoardCoords(boardRef.current!, {
    x: event.clientX,
    y: event.clientY,
  });
}

function mouseDown(event: MouseEvent) {
  console.log("pos: " + event.clientX + " " + event.clientY);
}

function mouseMove(event: MouseEvent) {}

function mouseUp(event: MouseEvent) {}

export default function NewBoard(props: ChessBoardProps) {
  const light = props.colorScheme?.light ?? "white";
  const dark = props.colorScheme?.dark ?? "#fca311";

  const boardRef = useRef<HTMLDivElement>(null);

  let possibleMoves = getPossibleMoves(props.selection, props.board);

  let pieces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = props.board.board()[i][j];
      if (piece) {
        pieces.push(Piece(i, j, piece.type, piece.color));
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // this should be refactored /combined with other methods to support dragging a piece to the target location
    // setSelection / makeMove will be passed in as props

    const r = windowToBoardCoords(boardRef.current!, {
      x: e?.clientX,
      y: e?.clientY,
    });
    // console.log(`Recalculated: ${r.x},${r.y}`);
    // console.log(`width: ${canvasRef.current?.clientWidth}`);
    // console.log(`height: ${canvasRef.current?.clientHeight}`);
    const cellSize = boardRef.current?.clientHeight! / 8;

    // convert to indexes
    const indices = {
      i: Math.floor(r.x / cellSize),
      j: Math.floor(r.y / cellSize),
    };
    console.log(`Recalculated, converted to index: ${indices.i},${indices.j}`);

    /* PROCESS THE MOVE */
    const chess = props.board;
    const board = chess.board();

    // TODO make the move, if it's a legal move (AND RETURN!)

    const color = props.isPlayerWhite ? "w" : "b";

    // (selection is same as previous || the place on board is empty || the place on the board is other player's color)
    if (
      convertIndicesToBoardNotation(indices) === props.selection ||
      board[indices.j][indices.i] === null ||
      board[indices.j][indices.i]?.color !== color
    ) {
      // set selection
      props.setSelection("");
    } else {
      // set selection
      console.log("new selection!");
      props.setSelection(convertIndicesToBoardNotation(indices));
    }
  };

  return (
    <div className={styles.container}>
      <Background
        refToPass={boardRef}
        light={light}
        dark={dark}
        onClickHandler={handleClick}
      >
        {pieces && pieces}
        {possibleMoves && possibleMoves}

        <Labels light={light} dark={dark} />
      </Background>
    </div>
  );
}

interface BoardColor {
  light: string;
  dark: string;
  children?: React.ReactNode;
  refToPass: React.RefObject<HTMLDivElement>;
  onClickHandler(event: React.MouseEvent): void;
}

function Background(props: BoardColor) {
  const light = props.light;
  const dark = props.dark;

  function sampleOnClick() {
    console.log("sheeeeee");
  }

  console.log("RENDERING BACKGROUND!");

  return (
    <div ref={props.refToPass} onClick={props.onClickHandler}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_37_2)">
          <rect width="800" height="800" fill={`${light}`} />
          <rect y="100" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="100" width="100" height="100" fill={light} />
          <rect x="200" y="100" width="100" height="100" fill={`${dark}`} />
          <rect x="300" y="100" width="100" height="100" fill={`${light}`} />
          <rect x="400" y="100" width="100" height="100" fill={`${dark}`} />
          <rect x="500" y="100" width="100" height="100" fill={`${light}`} />
          <rect x="600" y="100" width="100" height="100" fill={`${dark}`} />
          <rect x="100" width="100" height="100" fill={`${dark}`} />
          <rect x="200" width="100" height="100" fill={`${light}`} />
          <rect x="300" width="100" height="100" fill={`${dark}`} />
          <rect x="400" width="100" height="100" fill={`${light}`} />
          <rect x="500" width="100" height="100" fill={`${dark}`} />
          <rect x="600" width="100" height="100" fill={`${light}`} />
          <rect x="700" width="100" height="100" fill={`${dark}`} />
          <rect y="300" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="300" width="100" height="100" fill={`${light}`} />
          <rect x="200" y="300" width="100" height="100" fill={`${dark}`} />
          <rect x="300" y="300" width="100" height="100" fill={`${light}`} />
          <rect x="400" y="300" width="100" height="100" fill={`${dark}`} />
          <rect x="500" y="300" width="100" height="100" fill={`${light}`} />
          <rect x="600" y="300" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="200" width="100" height="100" fill={`${dark}`} />
          <rect x="200" y="200" width="100" height="100" fill={`${light}`} />
          <rect x="300" y="200" width="100" height="100" fill={`${dark}`} />
          <rect x="400" y="200" width="100" height="100" fill={`${light}`} />
          <rect x="500" y="200" width="100" height="100" fill={`${dark}`} />
          <rect x="600" y="200" width="100" height="100" fill={`${light}`} />
          <rect x="700" y="200" width="100" height="100" fill={`${dark}`} />
          <rect y="500" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="500" width="100" height="100" fill={`${light}`} />
          <rect x="200" y="500" width="100" height="100" fill={`${dark}`} />
          <rect x="300" y="500" width="100" height="100" fill={`${light}`} />
          <rect x="400" y="500" width="100" height="100" fill={`${dark}`} />
          <rect x="500" y="500" width="100" height="100" fill={`${light}`} />
          <rect x="600" y="500" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="400" width="100" height="100" fill={`${dark}`} />
          <rect x="200" y="400" width="100" height="100" fill={`${light}`} />
          <rect x="300" y="400" width="100" height="100" fill={`${dark}`} />
          <rect x="400" y="400" width="100" height="100" fill={`${light}`} />
          <rect x="500" y="400" width="100" height="100" fill={`${dark}`} />
          <rect x="600" y="400" width="100" height="100" fill={`${light}`} />
          <rect x="700" y="400" width="100" height="100" fill={`${dark}`} />
          <rect y="700" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="700" width="100" height="100" fill={`${light}`} />
          <rect x="200" y="700" width="100" height="100" fill={`${dark}`} />
          <rect x="300" y="700" width="100" height="100" fill={`${light}`} />
          <rect x="400" y="700" width="100" height="100" fill={`${dark}`} />
          <rect x="500" y="700" width="100" height="100" fill={`${light}`} />
          <rect x="600" y="700" width="100" height="100" fill={`${dark}`} />
          <rect x="100" y="600" width="100" height="100" fill={`${dark}`} />
          <rect x="200" y="600" width="100" height="100" fill={`${light}`} />
          <rect x="300" y="600" width="100" height="100" fill={`${dark}`} />
          <rect x="400" y="600" width="100" height="100" fill={`${light}`} />
          <rect x="500" y="600" width="100" height="100" fill={`${dark}`} />
          <rect x="600" y="600" width="100" height="100" fill={`${light}`} />
          <rect x="700" y="600" width="100" height="100" fill={`${dark}`} />
        </g>
        <defs>
          <clipPath id="clip0_37_2">
            <rect width="800" height="800" fill={`${light}`} />
          </clipPath>
        </defs>
      </svg>

      {props.children && props.children}
    </div>
  );
}
