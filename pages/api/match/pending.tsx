import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { type IMatch } from "../../../models/Match";
import { Chess } from 'chess.js'
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
            // Will receive data like:
            // {player1: [playerid], player2: [playerid]}

            try {
                let chess = new Chess();

                // console.log(chess.pgn());
                console.log("USER ID", req.body);

                // will have id's of both players
                let body = req.body.player1;
                
                let m = await Match.create<IMatch>({
                    player1id: new ObjectId(req.body.player1),
                    player2id: new ObjectId(req.body.player2),
                    pgn: "pending",
                    ongoing: true,
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
    }


}
