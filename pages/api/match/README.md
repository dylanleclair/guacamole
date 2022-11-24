# match API

This is how matches are created and updated.

## Desired functionality:

ENDPOINTS:

`GET`: `/api/match/[id]` fetches a game with the specified id

`GET`: `/api/match/active` requires user is logged in. will fetch the game that the user is playing (i.e. the match in database that has the ongoing flag set)

`POST`: requests will start games between two players.
