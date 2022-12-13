import { useContext, useState } from "react";
import { UserInfoContext } from "../../context/UserInfo";
import { IMatch } from "../../models/Match";
import { getJSON } from "../../utils/networkingutils";



function MatchHistoryCard(match: IMatch, key: number)
{
    return (
      <div className="bg-dark text-white">
        <h1>{match.player1id.instance}</h1>
        <h1>{match.player2id?.instance}</h1>
        <h1>{match.pgn}</h1>
      </div>
    );
}

/**
 * Renders an analysis board with the AnalysisData provided to it.
 *
 * Will be provided the pgn of the game to analyze.
 * @returns
 */
export default function MatchHistory(props: {}) {
    // const userInfo = useContext(UserInfoContext);
    const [matches, setMatches] = useState<IMatch[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    if (!isLoaded)
    {
        setIsLoaded(true);
        getJSON("/api/match/history").then((response) => {
                if (response.ok){
                    response.json().then((data) => {
                        setMatches(data as IMatch[]);
                    })
                }
            });
    }


    let matchCards = matches.map((x,i) => MatchHistoryCard(x,i));

    // find the user's last 5 matches, and then render a preview of them in a list.

  return (
    <div className="w- d-flex flex-column justify-content-center align-items-center gap-3">
        {matchCards && matchCards}
    </div>
  );
}
