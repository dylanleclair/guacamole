import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import Match, { IMatch } from "../../../models/Match";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IMatch | string>
) {
  const { method } = req;

  const { id } = req.query;

  switch (method) {
    /**
     * Fetches a match by ID specified as query parameter!
     */
    case "GET":
      try {
        if (typeof id === "string") {
          const matchData = await Match.findOne({
            _id: new ObjectId(id),  // lookup by ID in query param
          }).exec();
          if (matchData) {
            res.status(200).json(matchData); // respond to API call
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
