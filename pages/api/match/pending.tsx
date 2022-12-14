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

    /**
     * This endpoint is called by the WebSocket server. They create matches. 
     */
    switch (method) {
        case "POST":
            // create a match !!!
            // Will receive data like:
            // {player1: [playerid], player2: [playerid]}

            try {
                
                // create a new match with players listed.
                // notice ongoing is set to true.
                let m = await Match.create<IMatch>({
                    player1id: new ObjectId(req.body.player1),
                    player2id: new ObjectId(req.body.player2),
                    pgn: "pending",
                    ongoing: true,
                });

                if (m) {
                    // return the matchdata so the socket can join the room
                    res.status(200).json(m);

                }

            } catch (error) {
                console.log(error);
                res.status(400).json({ success: false });
            }
            break;
    }


}
