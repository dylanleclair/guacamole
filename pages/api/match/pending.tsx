//     case "POST":

// try {
//     let chess = new Chess();
//     // for (let i = 0; i < 20; i++) {
//     //   let index = randomInt(chess.moves().length);
//     //   chess.move(chess.moves()[index]);
//     // }
//     // console.log(chess.pgn());

//     console.log(req.body.playerid);


//     // random chess game
//     let m = await Match.create<IMatch>({
//         player1id: new ObjectId(req.body.playerid),
//         pgn: chess.pgn(),
//         ongoing: false,
//     });

//     if (m) {
//         res.status(200).json(m);
//     }

// } catch (error) {
//     console.log(error);
//     res.status(400).json({ success: false });
// }
// break;


import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { type IMatch } from "../../../models/Match";
import { Chess } from 'chess.js'
import ChessUser from "../../../models/User";
import { randomInt } from "crypto";
import { ObjectId } from "mongodb";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IMatch | {}>
) {
    const { method } = req;

    switch (method) {
        case "GET":
            try {

                // for now, just find any game that meets the criteria of "open"
                // i.e.: player 2 is not assigned and it is not active

                let match = await Match.findOne({ ongoing: false, player2id: null }).exec();
                console.log("is this null?", match);

                // do filtering for proper match
                if (match) {
                    res.status(200).json(match);
                } else {
                    throw new Error("catastrophe ...");
                }

            } catch (error) {
                console.log(error);
                res.status(400).json("welp that didn't go well did it.");
            }
            break;
        case "POST":
            // create a match !!!

            try {
                let chess = new Chess();

                console.log(chess.pgn());
                console.log(req.body);


                // random chess game
                let m = await Match.create<IMatch>({
                    player1id: new ObjectId(req.body.playerid),
                    pgn: "hi!",
                    ongoing: false,
                });

                if (m) {
                    // return the matchdata so the socket can join the room
                    console.log("POST DATA CREATED: ", m)
                    res.status(200).json(m);

                }

            } catch (error) {
                console.log(error);
                res.status(400).json({ success: false });
            }
            break;
        case "PATCH":
            // patch the provided user into the match as player2!
            try {

                console.log("MESSAGE BODY: ", req.body)

                let data = JSON.parse(req.body);

                let matchdata = data.match;
                let user = data.userId;

                console.log("MATCH: ", matchdata)


                let userId = new ObjectId(user);
                let matchId = new ObjectId(matchdata);
                let m = await Match.findOne<IMatch>({ _id: matchId }).exec();

                if (m) {

                    console.log("found the pending match!");
                    console.log(m);
                    await Match.where({ _id: matchId }).update({ player2id: userId }).exec().then(() => {

                        console.log("match updated!")
                        res.status(200).end();
                    }, () => {
                        throw new Error("The new player could not be added to the match!")
                    });

                    let updated = await Match.findOne<IMatch>({ _id: matchId }).exec();
                    console.log(updated);

                } else {
                    throw new Error("Match could not be found in database.")
                }

            } catch (error) {
                console.log(error)
                res.status(400).json({ success: false });
            }
    }


}
