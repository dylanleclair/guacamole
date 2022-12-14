import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { useSession, signIn, signOut } from "next-auth/react";
import { IMatch } from "../models/Match";
import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";

import ChessBoard from "../components/chessboard/ChessBoard";

import ChessUser, { IUser } from "../models/User";
import MatchFinder from "../components/MatchFinder/MatchFinder";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Puzzle from "../models/Puzzle";
import { css } from "@emotion/react";

/**
 * States of play. Used to decide what to render.
 */
enum PUZZLE_STATES {
  PUZZLE_INIT, // the user is not in a match and is not waiting for one
  PUZZLE_SOLVING, // the user is in a match & is playing
  PUZZLE_END, // the user has just ended a match (won, lost or drew)
}

interface PuzzleData {
  board: Chess;
  expected_line: string[];
  selection: string;
  isPlayerWhite: boolean;
  user: IUser | null;
  puzzle_state: PUZZLE_STATES;
  puzzle_index: number;
  perspective: string;
  show_solution: boolean;
}

// Loading in data of type Puzzle,
// Fetch that, and package it up as that data type.
// Reply with a random puzzle, and I will get it.
interface PuzzleInfo {
  start_position: string;
  expected_line: string[];
}

const defaultProps = {
  board: new Chess(),
  expected_line: [],
  selection: "",
  isPlayerWhite: true,
  user: null,
  puzzle_state: PUZZLE_STATES.PUZZLE_INIT,
  puzzle_index: 0,
  perspective: "white",
  show_solution: false
};

/** Used to hide / reveal the state of the puzzle. */
function Solution(props: { expected_line: string[]; puzzle_index: number }) {
  return (
    <div className="w-100 mt-4">
      <h3>Solution</h3>
      <p>Expected move: {props.expected_line[props.puzzle_index]}</p>
      <p>Expected line: {props.expected_line.join(" ")}</p>
    </div>
  );
}

function PlayerToMove(props: { isPlayerWhite: boolean }) {
  return (
    <div className="my-2 d-flex gap-3">
      <h4
        className=""
        css={css`
          line-height: 1.4em;
        `}
      >
        Player to Move
      </h4>
      <img
        css={css`
          width: 30px;
          height: 30px;
          background-color: ${props.isPlayerWhite ? "white" : "black"};
          border-radius: 0.5em;
          filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.2));
        `}
      />
    </div>
  );
}

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [state, setState] = useState<PuzzleData>(defaultProps);

  useEffect(() => {
    // load the match id from the database
    if (state.puzzle_state === PUZZLE_STATES.PUZZLE_INIT) {
      getPuzzle().then((puzzle) => {
        // console.log(puzzle);
        // console.log("parsing puzzle");
        let start_board = new Chess(puzzle.start_position);
        let expected_line = puzzle.expected_line;

        start_board.move(expected_line[0]);

        // get the user data from the user endpoint
        setState({
          ...state,
          puzzle_state: PUZZLE_STATES.PUZZLE_SOLVING,
          puzzle_index: 1,
          board: start_board,
          expected_line: expected_line,
          isPlayerWhite: start_board.turn() === "w" ? true : false,
          show_solution: false
        });
      });
    }

    if (
      state.puzzle_state === PUZZLE_STATES.PUZZLE_SOLVING &&
      state.puzzle_index % 2 === 0
    ) {
      // if solving and the move is wrong, undo the move.
      // console.log("HISTORY: ", state.board.history());
      if (
        state.board.history()[state.board.history().length - 1] !==
        state.expected_line[state.puzzle_index - 1]
      ) {
        // console.log("wrong move!!!");
        let s = new Chess();
        if (s.loadPgn(state.board.pgn())) {
          if (s.undo()) {
            // undo the last move
            // console.log("undoing move!!!");
            setTimeout(() => {
              setState({
                ...state,
                board: s,
                puzzle_index: state.puzzle_index - 1,
                selection: "",
              });
            }, 300);
          }
        }

        return;
      }

      // if solving, and player has made correct move,
      // make the next move in the line.

      // first check to see if puzzle complete
      if (state.puzzle_index === state.expected_line.length) {
        setState({
          ...state,
          // board: s,
          // puzzle_index: state.puzzle_index + 1,
          puzzle_state: PUZZLE_STATES.PUZZLE_END,
        });
        return;
      }

      let s = new Chess();
      s.loadPgn(state.board.pgn());
      let result = s.move(state.expected_line[state.puzzle_index]);

      // make the next move in the puzzle
      if (result) {
        setTimeout(() => {
          setState({
            ...state,
            board: s,
            puzzle_index: state.puzzle_index + 1,
            selection: "",
          });
        }, 300);
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
    let s = new Chess(state.board.fen());
    let result = s.move(moveToMake);

    // this makes sure that the move being sent to server is legal.
    // this is not really necessary, since the server will also validate before updating the match.
    if (result) {
      // check if move is in the expected line

      console.log(state.expected_line);

      setState({
        ...state,
        board: s,
        puzzle_index: state.puzzle_index + 1,
      });
    }
  }

  async function getPuzzle() {
    // Send http get request to localhost:3000/puzzles
    // Parse as JSOM into a JS object
    // Return the object I get

    // Fetch from the page

    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const puzzleFetch = fetch("/api/puzzles")
      .then((response) => response.json())
      .then((data) => data as PuzzleInfo);

    return puzzleFetch;
  }

  /**
   * Toggles the show_solution variable in state
   */
  const toggleShowSolution = () => {
    setState({
      ...state,
      show_solution: !state.show_solution
    })
  }

  /**
   * Resets the statemachine for this component
   */
  const handleClose = () => {
    setState({ ...state, puzzle_state: PUZZLE_STATES.PUZZLE_INIT });
  };

  return (
    <div className="row">
      <div className="col-12">
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Modal
          show={state.puzzle_state === PUZZLE_STATES.PUZZLE_END}
          onHide={handleClose}
        >
          <Modal.Header closeButton>
            <Modal.Title>Puzzle complete!</Modal.Title>
          </Modal.Header>
          <Modal.Body>Congratulations!! You've solved the puzzle!</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              Next Puzzle
            </Button>
          </Modal.Footer>
        </Modal>

        <main className="container d-flex flex-col justify-content-center align-items-center">

          <h1 className="display-2">Puzzles</h1>

          <p>Try your hand at a handful of AI generated puzzles!</p>

          <div className="w-100 card my-3">
            <div className="card-body d-flex flex-col justify-content-center align-items-center">
              <PlayerToMove isPlayerWhite={state.isPlayerWhite} />

              {state && (
                <ChessBoard
                  board={state.board}
                  perspective={state.perspective}
                  isPlayerWhite={state.isPlayerWhite}
                  selection={state.selection}
                  makeAmove={makeMove}
                  setSelection={(selection: string) => {
                    setState({
                      ...state,
                      selection: selection,
                    });
                  }}
                />
              )}
              <div className="w-100 d-flex justify-content-between mt-3">
                <div>
                  <button
                    className="btn btn-sm btn-dark mr-2"
                    onClick={flipBoard}
                  >
                    <i className="bi bi-arrow-repeat"></i> Flip Board
                  </button>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-dark ml-1"
                    onClick={flipBoard}
                  >
                    <i className="bi bi-arrow-right-circle"></i> Next Puzzle
                  </button>
                  <button className="btn btn-sm btn-dark" onClick={toggleShowSolution}>
                    <i className="bi bi-unlock"></i> Show Solution
                  </button>
                </div>
              </div>

              {state.show_solution && (
                <Solution
                  puzzle_index={state.puzzle_index}
                  expected_line={state.expected_line}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      protected: true,
      premium: true,
    },
  };
}

export default Home;
