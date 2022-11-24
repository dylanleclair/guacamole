/*

Matchmaking algorithm brief:

- when a user requests a game:
    - we check if a suitable game already exists
    - if not, then create a new Match entry in the database, with the player1id or player2id left null (at random)

this is all done by messaging over websocket!

*/
interface MatchFinderProps {
    onFindMatch(): void,
}

export default function MatchFinder(props: MatchFinderProps) {
    return (
        <div>
            <h1>Find a match</h1>


            <button className="btn btn-primary" onClick={props.onFindMatch}>Find a game</button>
        </div>
    )
}