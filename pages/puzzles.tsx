import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { useSession, signIn, signOut } from "next-auth/react";
import { IMatch } from "../models/Match";
import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js"



import ChessBoard from "../components/chessboard/ChessBoard";

import ChessUser, { IUser } from "../models/User";
import MatchFinder from "../components/MatchFinder/MatchFinder";

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Puzzle from "../models/Puzzle";

/**
 * States of play. Used to decide what to render.
 */
enum PUZZLE_STATES {
    PUZZLE_INIT,    // the user is not in a match and is not waiting for one
    PUZZLE_SOLVING, // the user is in a match & is playing
    PUZZLE_END      // the user has just ended a match (won, lost or drew)
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
}

const defaultProps = {
    board: new Chess(),
    expected_line: [],
    selection: "",
    isPlayerWhite: true,
    user: null,
    puzzle_state: PUZZLE_STATES.PUZZLE_INIT,
    puzzle_index: 0,
    perspective: "white"
}

let isInitialLoad = true;


function fetchPuzzle(): Puzzle {

    return {
        start_position: '8/8/8/8/8/2k5/3r4/2K5 w - - 26 127', 
        expected_line: ['Kb1', 'Rh2', 'Ka1', 'Kb3', 'Kb1', 'Rh1#']
    }

}

const Home: NextPage = () => {
    const { data: session } = useSession();
    const [state, setState] = useState<PuzzleData>(defaultProps);

    useEffect(() => {

        // load the match id from the database
        if (state.puzzle_state === PUZZLE_STATES.PUZZLE_INIT) {

            let puzzle = fetchPuzzle();

            let start_board = new Chess(puzzle.start_position);
            let expected_line = puzzle.expected_line;

            start_board.move(expected_line[0]);

            // get the user data from the user endpoint
            setState({
                ...state,
                puzzle_state: PUZZLE_STATES.PUZZLE_SOLVING,
                puzzle_index: 1,
                board: start_board,
                expected_line: fetchPuzzle().expected_line,
                isPlayerWhite: start_board.turn() === 'w' ? true : false
            });

        }

        if (state.puzzle_state === PUZZLE_STATES.PUZZLE_SOLVING && state.puzzle_index % 2 === 0)
        {

            
            // if solving and the move is wrong, undo the move.
            console.log("HISTORY: ", state.board.history());
            if (state.board.history()[state.board.history().length - 1] !== state.expected_line[state.puzzle_index -1])
            {
                console.log("wrong move!!!")
                let s = new Chess();
                if (s.loadPgn(state.board.pgn()))
                {

              

                    if (s.undo()) // undo the last move
                    {
                        // console.log("undoing move!!!");
                        setTimeout(() => { setState(
                        {
                            ...state,
                            board: s,
                            puzzle_index: state.puzzle_index - 1,
                            selection: ""
                        }
                        ); }, 300);

                    }
                }
                

                return;

            }



            // if solving, and player has made correct move, 
            // make the next move in the line.

            // first check to see if puzzle complete
            if (state.puzzle_index === state.expected_line.length)
            {
                setState({
                    ...state,
                    // board: s,
                    // puzzle_index: state.puzzle_index + 1,
                    puzzle_state: PUZZLE_STATES.PUZZLE_END,
                });
                return
            } 

            let s = new Chess(state.board.fen());
            let result = s.move(state.expected_line[state.puzzle_index]);

            // make the next move in the puzzle
            if (result)
            {

            setTimeout(() => { setState(
                {
                    ...state,
                    board:s,
                    puzzle_index: state.puzzle_index + 1,
                    selection: ""
                }
            ); }, 300);

            }

        }

        return () => {

        };

    }, [state]);

    /**
     * Flips the board perspective.
     */
    function flipBoard() {
        setState({
            ...state,
            perspective: (state.perspective === "white") ? "black" : "white",
        })
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


            console.log(state.expected_line)

            setState({
                ...state,
                board: s,
                puzzle_index: state.puzzle_index + 1
            });
        


        }

    };


    // check if the user is signed in. if they are, show them the matchmaking component

    const signin = session ? (
        <div>
            Signed in as {session.user?.email}
            <br />
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    ) : (
        <div>
            Not signed in.
            <br />
            <button onClick={() => signIn()}>Sign in</button>
        </div>
    );


    // const moves_cmpnt = state.moves?.map((str, i) => <li key={i}>{str}</li>)

    const handleClose = () => {
        setState({...state, puzzle_state: PUZZLE_STATES.PUZZLE_INIT});
    };

    return (
        <div className="row">
        <div className="col-4">
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>



            {signin}

            <Modal show={state.puzzle_state === PUZZLE_STATES.PUZZLE_END} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Puzzle complete!</Modal.Title>
                </Modal.Header>
                <Modal.Body>You've solved the puzzle! Dismiss to continue to another.</Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>

            <main>
                {/* <div>Match: {state.matchId}</div> */}

                <h1>expected move: {state.expected_line[state.puzzle_index]}</h1>

                <p>expected line: {state.expected_line.join(" ")}</p>
                <p>puzzle index: {state.puzzle_index}</p>

                <div>Player color: {(state.isPlayerWhite) ? "white" : "black"}</div>

                {state && <ChessBoard board={state.board} perspective={state.perspective} isPlayerWhite={state.isPlayerWhite} selection={state.selection} makeAmove={makeMove} setSelection={(selection: string) => {
                    setState(
                        {
                            ...state,
                            selection: selection
                        }
                    );
                }} />}
            </main>

            <button onClick={flipBoard}>flip perspective</button>

        </div>
        </div>

    );
};




export default Home;
