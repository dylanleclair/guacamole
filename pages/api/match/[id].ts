import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { IMatch } from "../../../models/Match";
import { Chess } from "chess.js";
import ChessUser from "../../../models/User";
import { randomInt } from "crypto";
import { ObjectId } from "mongodb";
import { match } from "assert";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IMatch | string>
) {
  const { method } = req;

  const { id } = req.query;

  switch (method) {
    case "GET":
      try {
        if (typeof id === "string") {
          console.log(id);
          const matchData = await Match.findOne({
            _id: new ObjectId(id),
          }).exec();
          if (matchData) {
            res.status(200).json(matchData);
          } else {
            throw Error("Match not found.");
          }
        }
      } catch {
        res.status(400).json("Match not found.");
      }

      break;
  }
}
