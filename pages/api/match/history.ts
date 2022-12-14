import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { IMatch } from "../../../models/Match";
import ChessUser, { IUser } from "../../../models/User";
import { ObjectId } from "mongodb";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IMatch[]>
) {
   /**
   * Fetch the user session (this is an authenticated endpoint)
   */
  const session = await unstable_getServerSession(req, res, authOptions);

  try {
    let email = "";
    if (session) {
      let e = session.user?.email;

      if (e) {
        email = e;
      } else throw Error("Session invalid.");
    } else throw Error("Session invalid.");

    // then do handling of request
    const { method } = req;

    switch (method) {
      case "GET":
        try {
          const user = await ChessUser.findOne<IUser>({
            email: email, // email should match the user's
          });


          if (user)
          {
            // fetch matches where the player played as WHITE or played as BLACK
                Match.find<IMatch>({$or:[{player1id: new ObjectId(user._id),
              ongoing: false,}, {player2id: new ObjectId(user._id),
              ongoing: false,}]}).sort('-date').populate('player2id').exec((err,docs) => {
                if (err) res.status(400).end();
                res.status(200).json(docs);
              });
            
            // res.status(200).json(matches);
          } 
        } catch {
          throw new Error();
        }

    }
  } catch (err) {
    res.status(400).end();
  }

}
