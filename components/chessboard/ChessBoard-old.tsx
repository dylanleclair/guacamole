import React, { useRef, useEffect, useState } from "react";
import styles from './chessboard.module.css'

import { Chess, PieceSymbol, Move } from 'chess.js'

/* Interfaces */

interface ChessBoardProps {
  board: Chess;
  isPlayerWhite: boolean;
}

interface ITextures {
  w: Map<string, HTMLImageElement>;
  b: Map<string, HTMLImageElement>;
}

interface Position {
  x: number;
  y: number;
}

interface Indexes {
  i: number;
  j: number;
}

interface BoardState {
  selection: string;
  board: Chess,
  color: string
}

/* Constants */

const g_PieceNames = ["B", "K", "N", "P", "Q", "R"]; // order matters

const g_textures: ITextures =
{
  w: new Map<PieceSymbol, HTMLImageElement>(),
  b: new Map<PieceSymbol, HTMLImageElement>()
}

const g_letters = "abcdefgh";

/* Main functions */

function draw(ctx: CanvasRenderingContext2D | null, pieceTextures: ITextures, state: BoardState) {

  let board = state.board;
  console.log("draw board: ", board.board())

  if (ctx == null) throw new Error("Could not get context");
  const canvas = ctx.canvas;

  const cellSize: number = canvas.width / 8;

  /* Draw the board (tiles) */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#294685";
  // draw background
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      // iterate over each entry on the board and draw it's background
      const xOff: number = (j * cellSize);
      const yOff: number = (i * cellSize);
      // draw the board
      let fill: boolean = (j % 2) === 0 ? true : false;
      if (i % 2 === 0) fill = !fill;

      if (fill)
        ctx.fillRect(xOff, yOff, cellSize, cellSize);
    }
  }

  /* Draw the pieces */

  let pieces = board.board();
  // console.log(board.board());
  // console.log(g_textures);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = pieces[i][j];
      // iterate over each entry on the board and draw it's background
      if (piece) {
        let col: string = piece.color;
        pieceTextures['w'];
        let texture = (col) === 'w' ? pieceTextures.w.get(piece.type) : pieceTextures.b.get(piece.type);
        if (texture !== undefined) { // ensure textures loaded
          const xOff: number = (j * cellSize);
          const yOff: number = (i * cellSize);

          ctx.drawImage(texture, xOff, yOff, cellSize, cellSize);
        } else {
          // console.log("texture missing.")
        }
      } else {
        // console.log("no pieces?");
      }
    }
  }

  /* Draw moves (if a selection exists) */
  if (state.selection !== "") {
    let selection = state.selection;
    let moves = state.board.moves({ verbose: true }) as Move[];
    console.log('Moves at selection');
    for (let i = 0; i < moves.length; i++) {
      let move: Move = moves[i];
      if (move.from === selection) {
        console.log(move);
        console.log(boardNotationToIndices(move.to));
        let pos = boardNotationToIndices(move.to);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        const circle = new Path2D();
        circle.arc((pos.x * cellSize) + (cellSize / 2), (pos.y * cellSize) + (cellSize / 2), 50, 0, 2 * Math.PI);
        ctx.fill(circle);
      }
    }
  }
  // draw as soon as previous frame is drawn
  //requestAnimationFrame(() => draw(ctx, pieceTextures, board));
}

const ChessBoard = ({ board, isPlayerWhite }: ChessBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  let initialState: BoardState = {
    selection: "",
    board: board,
    color: (isPlayerWhite) ? "w" : "b",
  };

  const [state, setState] = useState<BoardState>(initialState);

  // onUpdate/onLoad
  useEffect(() => {

    loadTextures(contextRef, state);

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context == null) throw new Error("Could not get context");
      contextRef.current = context;

      // initialize the context (the image we're drawing)
      contextRef.current.scale(window.devicePixelRatio, window.devicePixelRatio); //adjust this!
      contextRef.current.imageSmoothingEnabled = false;
      contextRef.current.canvas.height = 2000;
      contextRef.current.canvas.width = 2000;
    }

    console.log("BOARD: ", state.board.board())

    // redraw board every time state changes
    requestAnimationFrame(() => draw(contextRef.current, g_textures, state));

  }, [state]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {

    const r = windowToBoardCoords(canvasRef.current!, { x: e?.clientX, y: e?.clientY })
    // console.log(`Recalculated: ${r.x},${r.y}`);
    // console.log(`width: ${canvasRef.current?.clientWidth}`);
    // console.log(`height: ${canvasRef.current?.clientHeight}`);
    const cellSize = canvasRef.current?.clientHeight! / 8;

    // convert to indexes
    const indices = { i: Math.floor(r.x / cellSize), j: Math.floor(r.y / cellSize) };
    // console.log(`Recalculated, converted to index: ${indices.i},${indices.j}`);

    /* PROCESS THE MOVE */
    const chess = state.board;
    const board = chess.board();

    // TODO make the move, if it's a legal move (AND RETURN!)

    // (selection is same as previous || the place on board is empty || the place on the board is other player's color)
    if ((convertIndicesToBoardNotation(indices) === state.selection || board[indices.j][indices.i] === null) || (board[indices.j][indices.i]?.color !== state.color)) {
      // set selection
      setState({
        ...state,
        selection: "",
      });
    } else {
      // set selection
      setState({
        ...state,
        selection: convertIndicesToBoardNotation(indices),
      });
    }

  }

  return <canvas ref={canvasRef} className={styles.chessboard} onClick={handleClick} />;
};

/* Utility functions */

function convertIndicesToBoardNotation(pos: Indexes) {
  let result: string = `${g_letters[pos.i]}${8 - pos.j}`;
  return result;
}

function boardNotationToIndices(pos: string) {
  if (pos.length != 2) {
    throw Error('Input string invalid (wrong size).');
  }

  //  (a8) -> index 0
  //  (a7)
  //  (a6) 
  //  (a1) -> index 7

  let x = 0;
  for (let i = 0; i < g_letters.length; i++) {
    if (g_letters[i] == pos[0]) {
      x = i;
    }
  }

  return { x: x, y: Math.abs(Number.parseInt(pos[1]) - 8) };
}

function windowToBoardCoords(canvas: HTMLCanvasElement, windowCoords: Position): Position {
  const boundingRect = canvas.getBoundingClientRect();

  return { x: windowCoords.x - boundingRect.left, y: windowCoords.y - boundingRect.top };
}

function loadTextures(contextRef: React.MutableRefObject<CanvasRenderingContext2D | null>, state: BoardState) {
  if (g_textures.b.size === 0 && g_textures.w.size === 0) {
    /* load the pieces -> move into a new function */
    for (let i = 0; i < g_PieceNames.length; i++) {
      let item = g_PieceNames[i];
      // load the respective image from public and push it into images
      let whitePiece = new Image();
      let blackPiece = new Image();
      whitePiece.src = `/pieces/w${item}.svg`;
      blackPiece.src = `/pieces/b${item}.svg`;

      whitePiece.onload = () => {
        g_textures.w.set(item.toLowerCase(), whitePiece);
        requestAnimationFrame(() => draw(contextRef.current, g_textures, state!));
        if (g_textures.w.size === 6) {
          requestAnimationFrame(() => draw(contextRef.current, g_textures, state!));
        }
      };
      blackPiece.onload = () => {
        g_textures.b.set(item.toLowerCase(), blackPiece);
        if (g_textures.b.size === 6) {
          requestAnimationFrame(() => draw(contextRef.current, g_textures, state!));
        }
      }
    }
  }
}

ChessBoard.defaultProps = {
  board: new Chess(),
  isPlayerWhite: true
}

export default ChessBoard;
