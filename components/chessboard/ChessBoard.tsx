import { Chess, Move } from "chess.js";

import { css } from "@emotion/react";

import styles from "./chessboard.module.css";

import React, { MouseEvent, useRef, useState } from "react";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

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
  makeAmove(move: Move): void;
  perspective: string;
}

// they use special presets to determine positiions on board. transform is hardcoded

const FILES = "abcdefgh";

function convertIndicesToBoardNotation(
  pos: { i: number; j: number },
  perspective: string
) {
  let result: string = `${FILES[pos.i]}${8 - pos.j}`;

  if (perspective === "black") {
    result = `${FILES[7 - pos.i]}${pos.j + 1}`;
  }

  return result;
}

function boardNotationToIndices(pos: string, perspective: string) {
  if (pos.length != 2) {
    throw Error("Input string invalid (wrong size).");
  }

  // WHITE:
  //  (a8) -> index 0
  //  (a7)
  //  (a6)
  //  (a1) -> index 7

  // BLACK:
  // (h1) -> index 0
  // (h8) -> index 7


  let x = 0;
  for (let i = 0; i < FILES.length; i++) {
    if (FILES[i] == pos[0]) {
      x = i;
    }
  }

  let y = Math.abs(Number.parseInt(pos[1]) - 8);

  if (perspective === "black") {
    x = 7 - x;
    y = 7 - y;
  }

  return { x: x, y: y };
}

/** Calculates the possible moves for the selected piece, returning an SVG rendering them all as an overlay on the board. */

function PromotionPiece(i: number, move: Move, onClick: (move: Move) => void) {
  
  if (move.promotion){
    let piece = move.promotion;
    let color = move.color;
    return (
      <img
        key={i}
        className={styles.promotionOption}
        src={piece_url(piece, color)}
        onClick={() => {
          onClick(move);
        }}
      ></img>
    );
  }

}

function getPossibleMoves(
  selection: string,
  position: Chess,
  perspective: string
) {
  let moves = position.moves({ verbose: true }) as Move[];

  let movesDrawn = moves
    .filter((move) => move.from === selection)
    .map((move) => {
      let pos = boardNotationToIndices(move.to, perspective);

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
              background-color: rgba(0, 0, 0, 0.4);
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

function MoveHint(i: number, j: number, color: string){
    return (
      <div
        key={j * 8 + i}
        className={styles.piece}
        css={css`
        transform: translate(${j * 100}%, ${i * 100}%);
        background-color: ${color};
      `}
      ></div>
    );
}

function lastMoveHints(board: Chess, perspective: string)
{

  let hints: EmotionJSX.Element[] = [];
  // calculate the most recent move and render hints accordingly
  let history = board.history({verbose:true}) as Move[];
  console.log("HISTORY: ",history);
  let lastMove = history.pop();
  if (lastMove)
  {
    let indices = boardNotationToIndices(lastMove.from,perspective)
    hints.push(MoveHint(indices.y, indices.x, `rgba(255,0,0,0.35)`));
    indices = boardNotationToIndices(lastMove.to, perspective);

    hints.push(MoveHint(indices.y, indices.x, `rgba(255,0,0,0.35)`));
  }
  return hints;

}

function Labels(perspective: string, light: string, dark: string) {
  if (perspective === "black") {
    return (
      <div className={styles.labels}>
        <svg viewBox="0 0 100 100">
          <text x="0.75" y="3.5" font-size="2.8" fill={light}>
            1
          </text>
          <text x="0.75" y="15.75" font-size="2.8" fill={dark}>
            2
          </text>
          <text x="0.75" y="28.25" font-size="2.8" fill={light}>
            3
          </text>
          <text x="0.75" y="40.75" font-size="2.8" fill={dark}>
            4
          </text>
          <text x="0.75" y="53.25" font-size="2.8" fill={light}>
            5
          </text>
          <text x="0.75" y="65.75" font-size="2.8" fill={dark}>
            6
          </text>
          <text x="0.75" y="78.25" font-size="2.8" fill={light}>
            7
          </text>
          <text x="0.75" y="90.75" font-size="2.8" fill={dark}>
            8
          </text>
          <text x="10" y="99" font-size="2.8" fill={dark}>
            h
          </text>
          <text x="22.5" y="99" font-size="2.8" fill={light}>
            g
          </text>
          <text x="35" y="99" font-size="2.8" fill={dark}>
            f
          </text>
          <text x="47.5" y="99" font-size="2.8" fill={light}>
            e
          </text>
          <text x="60" y="99" font-size="2.8" fill={dark}>
            d
          </text>
          <text x="72.5" y="99" font-size="2.8" fill={light}>
            c
          </text>
          <text x="85" y="99" font-size="2.8" fill={dark}>
            b
          </text>
          <text x="97.5" y="99" font-size="2.8" fill={light}>
            a
          </text>
        </svg>
      </div>
    );
  }

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
  // we want to move the piece with the cursor
  // console.log("pos: " + event.clientX + " " + event.clientY);
}

function mouseMove(event: MouseEvent) {}

function mouseUp(event: MouseEvent) {}

interface PromotionParams {
  board: Chess;
  selection: string;
  makeAmove(move: Move): void;
}


export default function NewBoard(props: ChessBoardProps) {
  const light = props.colorScheme?.light ?? "white";
  const dark = props.colorScheme?.dark ?? "#fca311";

  const boardRef = useRef<HTMLDivElement>(null);
  const [isPromotion, setIsPromotion] = useState<boolean>(false);

  let possibleMoves = getPossibleMoves(
    props.selection,
    props.board,
    props.perspective
  );

  let gameBoard = props.board.board();

  if (props.perspective === "black") {
    // reverse everything in board, then the board itself
    // this flips the perspective of the board !
    for (let row of gameBoard) {
      row.reverse();
    }
    gameBoard.reverse();
  }

  let pieces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = gameBoard[i][j];
      if (piece) {
        pieces.push(Piece(i, j, piece.type, piece.color));
      }
    }
  }



function PromotionModal(props: PromotionParams) {
  let allMoves = props.board.moves({ verbose: true }) as Move[];

  const makeMove = (move: Move) => {
    props.makeAmove(move);
    setIsPromotion(false)
  };

  let pieces = allMoves
    .filter((x) => {
      return x.san.includes("=");
    })
    .map((x, i) => PromotionPiece(i, x, makeMove));

  // let pieces = PROMOTION_OPTIONS.map((x, i) => {
  //   return PromotionPiece(i, x, props.color === "w" ? "w" : "b");
  // });

  return (
    <div className={styles.promotionModalContainer}>
      <div
        className={`${styles.promotionModal} d-flex flex-col justify-content-center align-items-center container`}
      >
        <h1>Choose a piece to promote to!</h1>
        <div className="d-flex">{pieces}</div>
      </div>
    </div>
  );
}

  const handleClick = (e: React.MouseEvent) => {
    // this should be refactored /combined with other methods to support dragging a piece to the target location
    // setSelection / makeMove will be passed in as props

    if (isPromotion)
    return;

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
    // console.log(`Recalculated, converted to index: ${indices.i},${indices.j}`);

    /* PROCESS THE MOVE */
    const chess = props.board;
    const board = gameBoard;

    let boardNotation = convertIndicesToBoardNotation(
      indices,
      props.perspective
    );
    let availableMoves: Move[] = chess.moves({ verbose: true }) as Move[];
    for (let i = 0; i < availableMoves.length; i++) {
      // iterate over all the moves & see if the current selection -> target square is a move
      // console.log(props.selection);
      if (
        availableMoves[i].from === props.selection &&
        availableMoves[i].to === boardNotation
      ) {

        if (availableMoves[i].san.includes("="))
        {
          setIsPromotion(true);
        } else {
          // make the move
          props.makeAmove(availableMoves[i]);
        }

        return;
      }
    }

    

    const color = props.isPlayerWhite ? "w" : "b";

    // (selection is same as previous || the place on board is empty || the place on the board is other player's color)
    if (
      convertIndicesToBoardNotation(indices, props.perspective) ===
        props.selection ||
      board[indices.j][indices.i] === null ||
      board[indices.j][indices.i]?.color !== color
    ) {
      // set selection
      // console.log("no selection");
      // console.log(board[indices.j][indices.i] === null);
      // console.log(convertIndicesToBoardNotation(indices, props.perspective));
      props.setSelection("");
    } else {
      // set selection
      // console.log("new selection!");
      props.setSelection(
        convertIndicesToBoardNotation(indices, props.perspective)
      );
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
        {lastMoveHints(props.board,props.perspective)}
        {isPromotion && <PromotionModal selection={props.selection} board={props.board} makeAmove={props.makeAmove}/>}
        {pieces && pieces}
        {possibleMoves && possibleMoves}
        {Labels(props.perspective, dark, light)}
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

  // console.log("RENDERING BACKGROUND!");

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
