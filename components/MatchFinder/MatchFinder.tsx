import { MATCH_STATES } from "../../pages/match";

/*

Matchmaking algorithm brief:

- when a user requests a game:
    - we check if a suitable game already exists
    - if not, then create a new Match entry in the database, with the player1id or player2id left null (at random)

this is all done by messaging over websocket!

*/
interface MatchFinderProps {
    onFindMatch(): void,
    match_state: MATCH_STATES;
}

export default function MatchFinder(props: MatchFinderProps) {
    
    let findMatchButton = (props.match_state === MATCH_STATES.MATCH_WAITING) ? <p>Finding a match for you...</p> : <button className="btn btn-primary" onClick={props.onFindMatch}>Find a game</button>;
    
    return (
        <div className="d-flex flex-column my-3 justify-content-center align-items-center">
            <h1>Want to play some chess?</h1>

            {findMatchButton}
        
        </div>
    )
}