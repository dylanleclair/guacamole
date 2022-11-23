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

    console.log("re-render time :D ", state.board.board())

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


                fetch('/api/match/active').then((response) => {
                    if (response.ok) {
                        response.json().then((data) => {
                            let result = data as IMatch;


                            if (user) {
                                isPlayerWhite = (user._id === result.player1id) ? true : false;
                            }



                            let chess = new Chess();
                            chess.loadPgn(result.pgn);

                            console.log(chess.moves())

                            setState({ ...state, board: chess, matchId: result._id, isPlayerWhite: isPlayerWhite, user: user, perspective: (isPlayerWhite) ? 'white' : 'black' });

                            socket.emit(WebsocketAction.MATCH_CONNECT, result._id);

                        });
                    } else {
                        // what to do when no match could be fetched!

                    }
                })

            })

            isInitialLoad = false;
        }

        // socket.on(WebsocketAction.MATCH_START, (match) => {

        // })

        // set socket move handler
        socket.on(WebsocketAction.MOVE_RECEIVED, (msg) => {

            if (state) {
                // console.log("Received move: " + msg);

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

                let s = new Chess(state.board.fen());
                let result = s.move(msg)
                // console.log("New moves: ", s.moves())

                if (result) {
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
        };

    }, [state]);


    function flipBoard() {
        setState({
            ...state,
            perspective: (state.perspective === "white") ? "black" : "white",
        })
    }

    const emit_message = () => {

        let s = new Chess(state.board.fen());
        let result = s.move(state.input)

        if (result) {
            socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: state.input });

            setState({
                ...state,
                board: s,
                moves: [...state.moves, state.input]
            })
        }

    };

    function makeMove(moveToMake: Move) {
        let s = new Chess(state.board.fen());
        let result = s.move(moveToMake);

        console.log("MAKING THE MOVE: ", moveToMake);

        if (result) {
            console.log("MOVE SUCCESS: ", moveToMake);

            socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: moveToMake.san });

            console.log(s.board())
            console.log(state.board.board())

            setState({
                ...state,
                board: s,
                moves: [...state.moves, moveToMake.san],
            })
        }
    };

    function surrender() {
        // we need to tell websocket player got rekt & wants to give up

        // let result = s.move(state.input); 
        let playercolor = (state.isPlayerWhite) ? 'white' : 'black';
        let enemycolor = (state.isPlayerWhite) ? 'black' : 'white';

        socket.emit(WebsocketAction.MOVE, { game: state.matchId, move: `${playercolor} resigns` });

        let matchData = { winner: enemycolor, method: "resignation" };

        setState({
            ...state,
            isMatchOver: true,
            matchData: matchData
        })


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

            {state.matchId === "" && <MatchFinder />}

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
 * @returns 
 */
function GameOver(matchData: MatchMetadata) {
    return (
        <h3>{matchData.winner} wins by {matchData.method}</h3>
    )
}



export default Home;
