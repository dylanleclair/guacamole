import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { IMatch } from "../../../models/Match";
import ChessUser, { IUser } from "../../../models/User";
import { ObjectId } from "mongodb";



import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IMatch | string>
) {

    const session = await unstable_getServerSession(req, res, authOptions);


    try {

        let email = "";
        if (session) {

            let e = session.user?.email;

            if (e) {
                email = e;
            } else throw Error("Session invalid.")

        } else throw Error("Session invalid.");


        // then do handling of request
        const { method } = req;

        switch (method) {
            case "GET":
                try {

                    const user = await ChessUser.findOne<IUser>({
                        email: email // email should match the user's
                    });

                    if (user) {

                        let activeMatch = await Match.findOne<IMatch>({ player1id: new ObjectId(user._id), ongoing: true })
                        if (!activeMatch) {
                            activeMatch = await Match.findOne<IMatch>({ player2id: new ObjectId(user._id), ongoing: true })
                        }

                        if (activeMatch) {
                            // if they have a match, return the pgn (fen?)
                            res.status(200).json(activeMatch);
                        } else {
                            // if still not found, the user is not playing in a match.
                            res.status(400).json("Match not found.");
                        }

                    }

                } catch {
                    res.status(400).json("Match not found.");
                }

                break;
        }



    } catch (err) {
        res.status(401);
        res.end();
    }





    res.end();




}
