import { WebsocketAction } from "../../lib/emit_messages";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import styles from "../../styles/Home.module.css";

import { useSession, signIn, signOut } from "next-auth/react";
import { IMatch } from "../../models/Match";
import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js"



import ChessBoard from "../../components/chessboard/ChessBoard";

import SocketIO, { io, Socket } from "socket.io-client";
import ChessUser, { IUser } from "../../models/User";
import MatchFinder from "../../components/MatchFinder/MatchFinder";
import { match } from "assert";


// Make the `request` function generic
// to specify the return data type:
function request<T>(
    url: string,
    // `RequestInit` is a type for configuring 
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {}

    // This function is async, it will return a Promise:
): Promise<T> {

    // Inside, we call the `fetch` function with 
    // a URL and config given:
    return fetch(url, config)
        // When got a response call a `json` method on it
        .then((response) => response.json())
        // and return the result data.
        .then((data) => data as T);

    // We also can use some post-response
    // data-transformations in the last `then` clause.
}


const socket = SocketIO();

socket.on('notif', (msg) => {
    console.log(msg)
})


interface MatchMetadata {
    winner: string,
    method: string,
}


/**
 * States of play. Used to decide what to render.
 */
enum MATCH_STATES {
    MATCH_NONE,     // the user is not in a match and is not waiting for one
    MATCH_WAITING,  // the user is not in a match but is waiting for one
    MATCH_PLAYING,  // the user is in a match & is playing
    MATCH_END       // the user has just ended a match (won, lost or drew)
}

interface PlayInteface {
    board: Chess,
    moves: string[]
    input: string
    matchId: string
    selection: string,
    isPlayerWhite: boolean
    user: IUser | null,
    isMatchOver: boolean,
    matchData: MatchMetadata,
    perspective: string
}

const defaultProps = {
    board: new Chess(),
    moves: [],
    input: '',
    matchId: "",
    selection: "",
    isPlayerWhite: true,
    user: null,
    isMatchOver: false,
    matchData: { winner: "", method: "" },
    perspective: "white"
}

let isInitialLoad = true;




const Home: NextPage = () => {
    const { data: session } = useSession();
    const [state, setState] = useState<PlayInteface>(defaultProps);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const old = { ...state };
        old.input = e.target.value;
        setState(old);
    }

    function fetchActiveMatch(user: IUser | null) {
        fetch('/api/match/active').then((response) => {
            if (response.ok) {
                let isPlayerWhite = true;

                response.json().then((data) => {
                    let result = data as IMatch; // interpret data from endpoint as a Match

                    if (user) {
                        // if the player's id matches the player1id in Match
                        // the player's color is white!
                        isPlayerWhite = (user._id === result.player1id) ? true : false;
                    }

                    // load up the pgn for the match from the database
                    let chess = new Chess();
                    chess.loadPgn(result.pgn);

                    // update everything!
                    // the board, match ID, player color, user data, and default board perspective (same as player color)
                    setState({ ...state, board: chess, matchId: result._id, isPlayerWhite: isPlayerWhite, user: user, perspective: (isPlayerWhite) ? 'white' : 'black' });

                    socket.emit(WebsocketAction.MATCH_CONNECT, result._id);

                });
            } else {
                // what to do when no match could be fetched!
                // add user data to state
                setState({ ...state, user: user, });

            }
        })
    }


    useEffect(() => {

        // load the match id from the database
        if (isInitialLoad) {

            // get the user data from the user endpoint
            request<IUser>('/api/user').then((result) => {
                let user: IUser | null = null;
                let isPlayerWhite = true;


                if (result) {
                    user = result;
                    console.log(user);

                } else {
                    throw Error("User does not exist?");
                }


                fetchActiveMatch(user);

            })

            isInitialLoad = false;
        }

        /**
         * On match start / when the user finds a match.
         */
        socket.on(WebsocketAction.MATCH_START, (match) => {
            // update the data like we do when first forming a connection !!!
            // -> might want to move that stuff into a function tbh
            fetchActiveMatch(state.user);
        })

        // set socket move handler
        socket.on(WebsocketAction.MOVE_RECEIVED, (msg) => {

            // the move has been validated by the server & updated server-side. 
            // finally, we can update the board!

            if (state) {

                // check if the game is over
                if (msg.includes("resigns")) {
                    let winner = (msg.split(" ")[0] === 'white') ? 'black' : 'white';

                    let matchData = { winner: winner, method: "resignation" };

                    setState({
                        ...state,
                        isMatchOver: true,
                        matchData: matchData
                    })
                    return; // game is finished
                }

                // otherwise make the move, and check if the game is over.

                let s = new Chess(state.board.fen());
                let result = s.move(msg)

                if (result) {

                    // check if the game is over
                    if (s.isGameOver()) {
                        let matchData = { winner: '', method: "" };
                        // determine if draw or win & how
                        if (s.isCheckmate()) {
                            matchData.method = "checkmate"
                            matchData.winner = (s.turn() === "w") ? "black" : "white";
                        } else {
                            matchData.winner = "nobody"
                            matchData.method = " by ";
                            if (s.isInsufficientMaterial()) {
                                matchData.method += "insufficient material";
                            } else if (s.isStalemate()) {
                                matchData.method += "stalemate";
                            } else if (s.isThreefoldRepetition()) {
                                matchData.method += "repetition";
                            }
                        }

                        setState({
                            ...state,
                            isMatchOver: true,
                            matchData: matchData,
                            board: s,
                            moves: [...state.moves, msg]
                        })
                        return;
                    }


                    // if the game isn't over, update the state as usual.
                    setState({
                        ...state,
                        board: s,
                        moves: [...state.moves, msg]
                    });
                }
            }


        });


        console.log("state change!");

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('move');
            socket.off(WebsocketAction.MATCH_START)
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

    /** Sends the manually inputted move over the server 
     * This will probably be deprecated once we settle on how pieces are moved.
    */
    const emit_message = () => {

        let s = new Chess(state.board.fen());   // duplicate chess board from state
        let result = s.move(state.input)        // make the move

        // this makes sure that the move being sent to server is legal.
        // this is not really necessary, since the server will also validate before updating the match.
        if (result) {
            socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: state.input });
        }

    };

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
            // send the move to the server in real-time
            socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: moveToMake.san });
        }
    };

    /**
     * Sends a message to the server that indicates this user is requesting a match.
     */
    function onMatchRequest() {
        socket.emit(WebsocketAction.MATCH_REQUEST, state.user);
    }

    /**
     * Sends a message to the server that indicates this user has surrendered the game.
     * Immediately ends the game for both players. If successful, server sends resignation message through WebsocketAction.MOVE_RECEIVED. 
     */
    function surrender() {
        // we need to tell websocket player got rekt & wants to give up
        let playercolor = (state.isPlayerWhite) ? 'white' : 'black';
        socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: `${playercolor} resigns` });
    }


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


    const moves_cmpnt = state.moves?.map((str, i) => <li key={i}>{str}</li>)

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {signin}

            {state.matchId === "" && <MatchFinder onFindMatch={onMatchRequest} />}

            <main>
                <div>Match: {state.matchId}</div>

                <div>Player color: {(state.isPlayerWhite) ? "white" : "black"}</div>

                {state.isMatchOver && GameOver(state.matchData)}

                {state && <ChessBoard board={state.board} perspective={state.perspective} isPlayerWhite={state.isPlayerWhite} selection={state.selection} makeAmove={makeMove} setSelection={(selection: string) => {
                    setState(
                        {
                            ...state,
                            selection: selection
                        }
                    );
                }} />}
            </main>



            <input value={state.input} onChange={handleChange}></input>
            <button onClick={emit_message}>emit message</button>

            <h2>Color</h2>
            {/* <div>{state.color}</div> */}

            <h2>Moves</h2>
            <ol>
                {state.moves && moves_cmpnt}
            </ol>


            <button onClick={surrender}>surrender</button>
            <button onClick={flipBoard}>flip perspective</button>

        </div>
    );
};


/**
 * Displays the winner of the game and how they won
 * @param matchData 
 * @returns a JSX h3 component telling the user who won & how.
 */
function GameOver(matchData: MatchMetadata) {
    return (
        <h3>{matchData.winner} wins by {matchData.method}</h3>
    )
}



export default Home;
