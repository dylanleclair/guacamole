import { Chess, Move } from "chess.js";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ChessBoard from "../chessboard/ChessBoard";
import { css } from "@emotion/react";

import { postJSON } from "../../utils/networkingutils";

/**
 * States of play. Used to decide what to render.
 */
enum STATES {
  INIT, // the user is not in a match and is not waiting for one
  PLAYING, // the user is in a match & is playing,
  WAITING, // the user is waiting for the computer to make a move
  END, // the user has just ended a match (won, lost or drew)
}

interface ComputerProps {
  elo: number;
}

interface MatchMetadata {
  winner: string;
  method: string;
}

interface ComputerState {
  board: Chess;
  selection: string;
  isPlayerWhite: boolean;
  perspective: string;
  component_state: STATES;
  elo: number;
  matchData: MatchMetadata;
  skillLevel: number;
}

const defaultState = {
  skillLevel: 1,
  board: new Chess(),
  selection: "",
  isPlayerWhite: true,
  perspective: "white",
  component_state: STATES.INIT,
  elo: 1350,
  matchData: { winner: "", method: "" },
};

function checkGameOver(board: Chess): MatchMetadata {
  let matchData = { winner: "", method: "" };

  if (board.isGameOver()) {
    // determine if draw or win & how
    if (board.isCheckmate()) {
      matchData.method = "checkmate";
      matchData.winner = board.turn() === "w" ? "Black" : "White";
    } else {
      matchData.winner = "nobody";
      matchData.method = " by ";
      if (board.isInsufficientMaterial()) {
        matchData.method += "insufficient material";
      } else if (board.isStalemate()) {
        matchData.method += "stalemate";
      } else if (board.isThreefoldRepetition()) {
        matchData.method += "repetition";
      }
    }
  }
  return matchData;
}



function fetchBestMove(fen: string): Promise<string> | null {
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
        if (data.move) {
          // console.log("Recommended move: ", data.move);
          return data.move;
        }
      });

    return result;
  } catch (err) {
    console.log(err);
  }

  return null;
}

function fetchCPUMove(fen: string, skill: number): Promise<string> | null {
  try {
    let result = postJSON("/api/computer", { fen: fen , skill_level: skill})
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error();
        }
      })
      .then((data) => {
        // parse the move!!!
        if (data.move) {
          // console.log("Recommended move: ", data.move);
          return data.move;
        }
      });

    return result;
  } catch (err) {
    console.log(err);
  }

  return null;
}

/**
 * Renders the page where there is a ChessBoard that you can play against a computer player in!
 *
 * Will be provided the ELO for Stockfish to target.
 * @returns Emotion/React component !!!
 */
export default function ComputerBoard(props: ComputerProps) {
  const [state, setState] = useState<ComputerState>(defaultState);

  // basically all we need to do is fetch an endpoint. as long as we have ELO & other settings, we don't need anything else.

  function resign() {

    let color = state.isPlayerWhite ? "white" : "black";
    
    let matchData = { winner: "", method: "" };

    matchData.method = "resignation";
    matchData.winner = "Computer"

    setState({
      ...state,
      component_state: STATES.END,
      matchData: matchData
    });

    return matchData;
  }

  useEffect(() => {
    // load the match id from the database
    if (state.component_state === STATES.INIT) {
      // fetch the PGN of the match

      // coinflip for white/black pieces
      let coinflip = Math.round(Math.random()) === 1 ? true : false;

      if (coinflip) {
        setState({
          ...state,
          component_state: STATES.PLAYING,
          selection: "",
          isPlayerWhite: coinflip,
          perspective: "white",
          elo: 1350,
        });
      } else {
        setState({
          ...state,
          component_state: STATES.WAITING,
          selection: "",
          isPlayerWhite: coinflip,
          perspective: "black",
          elo: 1350,
        });
      }
    }

    if (state.component_state === STATES.WAITING) {
      let computerMove = fetchCPUMove(state.board.fen(), state.skillLevel);

      let s = new Chess();
      s.loadPgn(state.board.pgn());

      if (computerMove) {
        computerMove.then((move) => {
          s.move(move);

          let metadata = checkGameOver(s);

          setState({
            ...state,
            board: s,
            component_state: (s.isGameOver()) ? STATES.END : STATES.PLAYING,
            elo: 1350,
            matchData: metadata,
          });
        });
      } else {
        console.log(
          "something has gone horribly wrong. could not get CPU move."
        );
      }
    }

    return () => {};
  }, [state]);

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
    let s = new Chess();
    s.loadPgn(state.board.pgn());
    let result = s.move(moveToMake);

    if (result) {
    
      let metadata = checkGameOver(s);

      setState({
        ...state,
        board: s,
        component_state: (s.isGameOver()) ? STATES.END : STATES.WAITING,
        matchData: metadata,
      });
    }
  }

  /**
   * Select piece
   */
  function selectPiece(selection: string) {
    if (state.component_state === STATES.PLAYING) {
      setState({
        ...state,
        selection: selection,
      });
    }
  }
  <div>
    <h1>History</h1>
    <div>{state.board.history().join(" ")}</div>
  </div>;

  function handleClose() {
    // reset state!!
    setState({
      skillLevel: 1,
      board: new Chess(),
      selection: "",
      isPlayerWhite: true,
      perspective: "white",
      component_state: STATES.INIT,
      elo: 1350,
      matchData: { winner: "", method: "" },
    });
  }
  function updateSkillLevel(e: React.FormEvent<HTMLInputElement>)
  {
      setState({...state,
      skillLevel:  parseInt(e.currentTarget.value) });
  }

  return (
    <div className="w-100 card my-3">
      <div className="card-body d-flex flex-col justify-content-center align-items-center">

    <h3>CPU Skill Level: {state.skillLevel} </h3>
            <input type="range" className="form-range" min="1" max="5" value={state.skillLevel} id="playerSkillLevel" onChange={updateSkillLevel} />

        {state && (
          <ChessBoard
            board={state.board}
            perspective={state.perspective}
            isPlayerWhite={state.isPlayerWhite}
            selection={state.selection}
            makeAmove={makeMove}
            setSelection={selectPiece}
          />
        )}

        <Modal
          show={state.component_state === STATES.END}
          onHide={handleClose}
        >
          <Modal.Header closeButton>
            <Modal.Title>Match ended</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {state.matchData.winner} wins by {state.matchData.method}.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
            Close
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="w-100 d-flex justify-content-between mt-3">
          <div>
            <button className="btn btn-sm btn-dark mr-2" onClick={flipBoard}>
              <i className="bi bi-arrow-repeat"></i> Flip Board
            </button>
          </div>

          <div className="d-flex gap-2">

            <button className="btn btn-sm btn-dark" onClick={resign}>
              <i className="bi bi-flag"></i> Resign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
