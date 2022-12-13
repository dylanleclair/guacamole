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
            let matches = await Match.find<IMatch>({$or:[{player1id: new ObjectId(user._id),
              ongoing: false,}, {player2id: new ObjectId(user._id),
              ongoing: false,}]});
            res.status(200).json(matches);
            return;
          } 
          throw new Error();
        } catch {
          throw new Error();
        }

        break;
    }
  } catch (err) {
    res.status(400).end();
  }

}
