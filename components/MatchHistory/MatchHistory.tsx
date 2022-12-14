import { css } from "@emotion/react";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { Chess } from "chess.js";
import Link from "next/link";
import { userInfo } from "os";
import { useContext, useState } from "react";
import { UserInfo, UserInfoContext } from "../../context/UserInfo";
import { IMatch } from "../../models/Match";
import { IUser } from "../../models/User";
import { getJSON, postJSON } from "../../utils/networkingutils";
import ChessBoard from "../chessboard/ChessBoard";

function PlayerColor(props: {color: string})
{
    return (
      <img
        css={css`
          width: 1em;
          height: 1em;
          background-color: ${props.color};
          border-radius: 0.5em;
          filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.2));
        `}
      />
    );
}

function MatchHistoryCard(match: IMatch, player: IUser, key: number)
{

    let board = new Chess();
    board.loadPgn(match.pgn);

    let perspective = (player._id === match.player1id) ? "white" : "black";
    let isPlayerWhite = (perspective === 'white') ? true : false;

    const WIN = (
      <h3>
        <span className="badge bg-success">Win</span>
      </h3>
    );

    const LOSS = (
      <h3>
        <span className="badge bg-danger">Loss</span>
      </h3>
    );
    

    let isWinner = (match.winner === player._id) ? WIN : LOSS ;

    return (
      <div
        className="bg-light py-4"
        css={css`
          border-radius: 1em;
        `}
      >
        <div className="d-flex justify-content-center align-items-center">
          <div className="col-6">
            <Link href={`/analyze/${match._id}`} passHref>
              <ChessBoard
                board={board}
                perspective={perspective}
                isPlayerWhite={isPlayerWhite}
                selection={""}
                setSelection={() => {}}
                makeAmove={() => {}}
              />
            </Link>
          </div>
          <div className="col-6">
            <div className="d-flex mx-3 gap-3 w-100 flex-column justify-content-center align-items-start">
              {isWinner}
              <div className="d-flex justify-content-center align-items-center gap-2">
                <PlayerColor color="black" />
                <div className="lead">
                  {isPlayerWhite ? "Opponent" : "You"}
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center gap-2">
                <PlayerColor color="white" />
                <div className="lead">
                  {isPlayerWhite ? "You" : "Opponent"}
                </div>
              </div>

              <Link href={`/analyze/${match._id}`} passHref>
                <div className="btn btn-lg btn-primary">Analyze</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
}

/**
 * Renders a user's match history.
 *
 * @returns JSX elements rendering the games a user has played.
 */
export default function MatchHistory(props: {}) {
    const userInfo = useContext(UserInfoContext);
    const [matches, setMatches] = useState<IMatch[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);


    if (!isLoaded)
    {
        setIsLoaded(true);
        getJSON("/api/match/history").then((response) => {
                if (response.ok){
                    response.json().then((data) => {
                        data.reverse();
                        setMatches(data as IMatch[]);
                    })
                }
            });
    }

    let matchCards: EmotionJSX.Element[] = [];

    if (userInfo.user)
    {
        const user = userInfo.user;
        if (user != undefined)
        {
            matchCards = matches.map((x,i) => MatchHistoryCard(x,user,i));
        }
    }

    // find the user's last 5 matches, and then render a preview of them in a list.

  return (matchCards.length > 0) ?
    (<div className="my-5 d-flex flex-column justify-content-center align-items-center gap-3">
        <h1>Your Match History</h1>
        {matchCards && matchCards}
    </div>) : (<div></div>)
  ;
}
