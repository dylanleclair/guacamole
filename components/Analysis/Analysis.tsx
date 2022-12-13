import { css } from "@emotion/react";
import { Chess, Move } from "chess.js";
import { useEffect, useState } from "react";
import { Evaluation } from "../../pages/api/computer";
import { postJSON } from "../../utils/networkingutils";
import ChessBoard from "../chessboard/ChessBoard";

enum STATES {
  INIT,
  ANALYZE
}

interface AnalysisProps {
  match_pgn: string;
  canReset: boolean
}

interface AnalysisState {
  board: Chess;
  history: string[];
  match_pgn: string;
  move_index: number;
  selection: string;
  isPlayerWhite: boolean;
  perspective: string;
  component_state: STATES;
}

const defaultState = {
  board: new Chess(),
  history: [],
  match_pgn: "",
  move_index: 0,
  selection: "",
  isPlayerWhite: true,
  perspective: "white",
  component_state: STATES.INIT,
};

// add an extra "perspective" to the ChessBoard component called analysis, that will allow moves on both sides.

// Analysis will have two variants. For now, we will focus on support a "game review",
// where a player can revisit a game that they played and see the best moves / lines for each position.

// Naive approach: just load the first X moves of the game, where X is move index?
// OR: load the entire pgn. save the history.
// then, we can simply start with a fresh board and play X moves from the history.
//      - if back button pressed, undo the move & lower index
//      - otherwise, we simply make the next move in the history & increment index

/**
 * Renders an analysis board with the AnalysisData provided to it.
 *
 * Will be provided the pgn of the game to analyze.
 * @returns
 */
export default function Analysis(props: AnalysisProps) {
  const [state, setState] = useState<AnalysisState>(defaultState);
  const [evaluation, setEvaluation] = useState<Evaluation>();
  useEffect(() => {
    // load the match id from the database
    if (state.component_state === STATES.INIT) {
      // fetch the PGN of the match

      try {
        let pgn = props.match_pgn;
        let board = new Chess();

        let validPGN = board.loadPgn(pgn);

        if (validPGN) {
          setState({
            ...state,
            match_pgn: pgn,
            history: board.history() as string[],
            component_state: STATES.ANALYZE,
          });
        } else {
          throw Error("PGN could not be parsed !!");
        }
      } catch (err) {

      }
    }

    return () => { };
  }, [state]);


  function forceUpdate() {
    setState({
      ...state,
      board: new Chess(),
      history: [],
      match_pgn: "",
      move_index: 0,
      selection: "",
      isPlayerWhite: true,
      perspective: "white",
      component_state: STATES.INIT,
    });
  }

  /**
   * Flips the board perspective.
   */
  function flipBoard() {
    setState({
      ...state,
      perspective: state.perspective === "white" ? "black" : "white",
    });
  }

  /**
   * Sends the move the player wants to make to the server for processing.
   * @param moveToMake the Move (from chess.js) that the player wants to make
   */
  function makeMove(moveToMake: Move) {
    let s = new Chess(state.board.fen());
    let result = s.move(moveToMake);

    // this makes sure that the move being sent to server is legal.
    // this is not really necessary, since the server will also validate before updating the match.
    if (result) {
      // check if move is in the expected line
      // console.log(state.expected_line)
      // setState({
      //     ...state,
      //     board: s,
      //     puzzle_index: state.puzzle_index + 1
      // });
    }
  }


  function fetchEval(fen: string): Promise<Evaluation> | null {
    try {
      let result = postJSON("/api/computer", { fen: fen })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error();
          }
        })
        .then((data) => {
          // parse the move!!!
          if (data) {
            // console.log("Recommended move: ", data.move);
            return data;
          }
        });
  
      return result;
    } catch (err) {
      console.log(err);
    }
  
    return null;
  }

  
  /**
   * Select piece
   */
  function selectPiece(selection: string) {
    // if (state.component_state === STATES.ANALYZE) {
    //   setState({
    //     ...state,
    //     selection: selection,
    //   });
    // }
  }

  function updateEvaluation(fen: string)
  {
    let aiEval = fetchEval(fen);
    if (aiEval)
    {
      aiEval.then((evalData) => {
        console.log("Evaluation: ", evalData);
        setEvaluation(evalData);
      })
    }
  }

  function handleNextClicked() {

    if (state.move_index < state.history.length)
    {

      let new_board = new Chess();
      let isPGNValid = new_board.loadPgn(state.board.pgn());
      new_board.move(state.history[state.move_index]);
      // make the move & increment move index
      setState({
        ...state,
        board: new_board,
        move_index: state.move_index + 1,
      });

      updateEvaluation(new_board.fen());

    }


  }

  function handleBackClicked() {
    if (state.move_index != 0)
    {
          let new_board = new Chess();
          let isPGNValid = new_board.loadPgn(state.board.pgn());

          if (isPGNValid) {
            new_board.undo();
            // make the move & increment move index
            setState({
              ...state,
              board: new_board,
              move_index: state.move_index - 1,
            });
            updateEvaluation(new_board.fen());

          }
    }

  }

  function EvalBar()
  {

    if (evaluation)
    {

      // parse the wdl

      return  (<div className="progress">
      <div className="progress-bar bg-danger" role="progressbar" css={css`width: ${Math.round(parseInt(evaluation.wdl[0]) / 100)}%`} aria-valuenow={Math.round(parseInt(evaluation.wdl[0]) / 100)} aria-valuemin={0} aria-valuemax={100}></div>
      </div>);
    }


  }

  return (
    <div className="w-100">
      {props.canReset && (
        <div className="btn btn-primary w-100 my-3" onClick={forceUpdate}>
          Load PGN
        </div>
      )}

      <ChessBoard
        board={state.board}
        isPlayerWhite={state.isPlayerWhite}
        perspective={state.perspective}
        setSelection={selectPiece}
        selection={state.selection}
        makeAmove={makeMove}
      />

      <div className="w-100 d-flex justify-content-between mt-3">
        <div>
          <button className="btn btn-sm btn-dark mr-2" onClick={flipBoard}>
            <i className="bi bi-arrow-repeat"></i> Flip Board
          </button>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-dark ml-1"
            onClick={handleBackClicked}
          >
            <i className="bi bi-arrow-left-circle"></i> Previous
          </button>
          <button className="btn btn-sm btn-dark" onClick={handleNextClicked}>
            Next <i className="bi bi-arrow-right-circle"></i>
          </button>
        </div>
      </div>
      
      { evaluation && 
      <div className="my-3">
        <h1>AI's evaluation</h1>
        <div>Best move: {evaluation?.move}</div>
        <div>Best line: {evaluation?.topLines[0].join(" ")}</div>

      </div>
}
    </div>
  );
}
