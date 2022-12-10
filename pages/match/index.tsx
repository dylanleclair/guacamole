import { WebsocketAction } from "../../lib/emit_messages";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import styles from "../../styles/Home.module.css";

import { useSession, signIn, signOut } from "next-auth/react";
import { IMatch } from "../../models/Match";
import { useContext, useEffect, useState } from "react";
import { Chess, Move } from "chess.js";

import ChessBoard from "../../components/chessboard/ChessBoard";

import SocketIO, { io, Socket } from "socket.io-client";
import ChessUser, { IUser } from "../../models/User";
import MatchFinder from "../../components/MatchFinder/MatchFinder";
import { match } from "assert";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { postJSON, request } from "../../utils/networkingutils";
import { UserInfoContext } from "../../context/UserInfo";
import { UserInfo } from "os";
import { css } from "@emotion/react";
import CircularLoader from "../../components/CircularLoader";

const socket = SocketIO();

interface MatchMetadata {
  winner: string;
  method: string;
}

/**
 * States of play. Used to decide what to render.
 */
export enum MATCH_STATES {
  MATCH_INIT,
  MATCH_NONE, // the user is not in a match and is not waiting for one
  MATCH_WAITING, // the user is not in a match but is waiting for one
  MATCH_PLAYING, // the user is in a match & is playing
  MATCH_END, // the user has just ended a match (won, lost or drew)
}

interface PlayInteface {
  board: Chess;
  moves: string[];
  input: string;
  matchId: string;
  selection: string;
  isPlayerWhite: boolean;
  user: IUser | null;
  opponent: IUser | null;
  matchData: MatchMetadata;
  perspective: string;
  match_state: MATCH_STATES;
}

const defaultProps = {
  board: new Chess(),
  moves: [],
  input: "",
  matchId: "",
  selection: "",
  isPlayerWhite: true,
  opponent: null,
  user: null,
  matchData: { winner: "", method: "" },
  perspective: "white",
  match_state: MATCH_STATES.MATCH_INIT,
};

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [state, setState] = useState<PlayInteface>(defaultProps);
  const userInfo = useContext(UserInfoContext);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const old = { ...state };
    old.input = e.target.value;
    setState(old);
  }

  function fetchActiveMatch(user: IUser | null) {
    fetch("/api/match/active").then((response) => {
      if (response.ok) {
        let isPlayerWhite = true;

        console.log("GOT ACTIVE MATCH?");

        response.json().then((data) => {
          let result = data as IMatch; // interpret data from endpoint as a Match

          if (user) {
            let oppositePlayerID =
              user._id === result.player1id
                ? result.player2id
                : result.player1id;
            postJSON("/api/user/info", { id: oppositePlayerID }).then(
              (innerResponse) => {
                // load up the pgn for the match from the database
                // if the player's id matches the player1id in Match
                // the player's color is white!
                isPlayerWhite = user._id === result.player1id ? true : false;
                console.log("RESPONSE BODY:", response.body);
                if (innerResponse.ok) {
                  innerResponse.json().then((opponent) => {
                    console.log("OPPONENT: ", opponent);

                    let chess = new Chess();
                    chess.loadPgn(result.pgn);

                    // update everything!
                    // the board, match ID, player color, user data, and default board perspective (same as player color)
                    setState({
                      ...state,
                      board: chess,
                      matchId: result._id,
                      isPlayerWhite: isPlayerWhite,
                      user: user,
                      perspective: isPlayerWhite ? "white" : "black",
                      match_state: MATCH_STATES.MATCH_PLAYING,
                      opponent: opponent as IUser,
                    });

                    socket.emit(WebsocketAction.MATCH_CONNECT, result._id);
                  });
                }
              }
            );
          }
        });
      } else {
        // what to do when no match could be fetched!
        // add user data to state
        setState({
          ...state,
          user: user,
          match_state: MATCH_STATES.MATCH_NONE,
        });
      }
    });
  }

  useEffect(() => {
    // load the match id from the database
    if (state.match_state === MATCH_STATES.MATCH_INIT) {
      if (userInfo?.user) {
        fetchActiveMatch(userInfo.user);
      } else {
        setState({
          ...state,
          match_state: MATCH_STATES.MATCH_INIT,
        });
      }
    }

    /**
     * On match start / when the user finds a match.
     */
    socket.on(WebsocketAction.MATCH_START, (match) => {
      // update the data like we do when first forming a connection !!!
      // -> might want to move that stuff into a function tbh
      console.log("GOT MATCH START!");
      fetchActiveMatch(state.user);
    });

    // set socket move handler
    socket.on(WebsocketAction.MOVE_MADE, (msg) => {
      // the move has been validated by the server & updated server-side.
      // finally, we can update the board!

      if (state) {
        // check if the game is over
        if (msg.includes("resigns")) {
          let winner = msg.split(" ")[0] === "white" ? "black" : "white";

          let matchData = { winner: winner, method: "resignation" };

          setState({
            ...state,
            match_state: MATCH_STATES.MATCH_END,
            matchData: matchData,
          });
          return; // game is finished
        }

        // otherwise make the move, and check if the game is over.

        let s = new Chess();
        s.loadPgn(state.board.pgn());

        let result = s.move(msg);

        if (result) {
          // check if the game is over
          if (s.isGameOver()) {
            let matchData = { winner: "", method: "" };
            // determine if draw or win & how
            if (s.isCheckmate()) {
              matchData.method = "checkmate";
              matchData.winner = s.turn() === "w" ? "black" : "white";
            } else {
              matchData.winner = "nobody";
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
              match_state: MATCH_STATES.MATCH_END,
              matchData: matchData,
              board: s,
              moves: [...state.moves, msg],
            });
            return;
          }

          // if the game isn't over, update the state as usual.
          setState({
            ...state,
            board: s,
            moves: [...state.moves, msg],
          });
        }
      }
    });

    console.log("state change!");

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(WebsocketAction.MOVE_MADE);
      socket.off(WebsocketAction.MATCH_START);
    };
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

  /** Sends the manually inputted move over the server
   * This will probably be deprecated once we settle on how pieces are moved.
   */
  const emit_message = () => {
    let s = new Chess(state.board.fen()); // duplicate chess board from state
    let result = s.move(state.input); // make the move

    // this makes sure that the move being sent to server is legal.
    // this is not really necessary, since the server will also validate before updating the match.
    if (result) {
      socket.emit(WebsocketAction.MAKE_MOVE, {
        game: state.matchId,
        move: state.input,
      });
    }
  };

  /**
   * Select piece
   */
  function selectPiece(selection: string) {
    if (state.match_state === MATCH_STATES.MATCH_PLAYING) {
      setState({
        ...state,
        selection: selection,
      });
    }
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
      // send the move to the server in real-time
      socket.emit(WebsocketAction.MAKE_MOVE, {
        game: state.matchId,
        move: moveToMake.san,
      });
    }
  }

  /**
   * Sends a message to the server that indicates this user is requesting a match.
   */
  function onMatchRequest() {
    setState({
      ...state,
      match_state: MATCH_STATES.MATCH_WAITING,
    });
    socket.emit(WebsocketAction.MATCH_REQUEST, state.user);
  }

  /**
   * Sends a message to the server that indicates this user has surrendered the game.
   * Immediately ends the game for both players. If successful, server sends resignation message through WebsocketAction.MOVE_RECEIVED.
   */
  function surrender() {
    // we need to tell websocket player got rekt & wants to give up
    let playercolor = state.isPlayerWhite ? "white" : "black";
    socket.emit(WebsocketAction.MAKE_MOVE, {
      game: state.matchId,
      move: `${playercolor} resigns`,
    });
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

  const moves_cmpnt = state.moves?.map((str, i) => <li key={i}>{str}</li>);

  const handleClose = () => {
    setState({ ...state, matchId: "", match_state: MATCH_STATES.MATCH_INIT });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {state.matchId === "" && (
        <MatchFinder
          onFindMatch={onMatchRequest}
          match_state={state.match_state}
        />
      )}

      <Modal
        show={state.match_state === MATCH_STATES.MATCH_END}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Match ended</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {state.matchData.winner} wins by {state.matchData.method}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <main className="container d-flex flex-col justify-content-center align-items-center">
        {/* <div>Match: {state.matchId}</div> */}

        <h1 className="display-2">Play vs Human</h1>

        <p>Play a match against other players from across the world!</p>

        {state.match_state === MATCH_STATES.MATCH_INIT && <CircularLoader />}

        <div className="w-100 card my-3">
          <div className="card-body d-flex flex-col justify-content-center align-items-center">
            <div>Match: {state.matchId}</div>

            <div>Player color: {state.isPlayerWhite ? "white" : "black"}</div>
            <PlayerProfile user={state.user} />
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
            <PlayerProfile user={state.opponent} />
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
                  onClick={surrender}
                  className="btn btn-sm btn-dark ml-1"
                >
                  <i className="bi bi-arrow-right-circle"></i>Surrender
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function PlayerProfile(props: { user: IUser | null }) {
  if (props.user) {
    let elo = props.user.elo ? props.user.elo : 5000;

    return (
      <div className="row w-100 bg-dark text-white">
        <div className="col-2 p-0">
          <img src={props.user.image} className="img-fluid" />
        </div>
        <div className="col-10">
          <h1 className="display-6">
            {props.user.name}{" "}
            <img
              src="diamond.png"
              css={css`
                width: 1em;
                height: 1em;
              `}
              className="diamond-icon"
            />
            <span
              css={css`
                font-size: 0.7em;
              `}
            >{` (${elo})`}</span>
          </h1>
        </div>
      </div>
    );
  }
  return <div></div>;
}

export async function getStaticProps() {
  return {
    props: {
      protected: true,
    },
  };
}

export default Home;
