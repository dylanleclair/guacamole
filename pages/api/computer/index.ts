import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import { postJSON } from "../../../utils/networkingutils";

/**
 * This endpoint acts as a proxy to the AI microservice (running in docker)
 */

var PROXY = "http://sf-engine:8228/";

interface MoveReply {
  move: String;
}

/**
 * Send a real POST request to the chess engine microservice with the current board position.
 * @param fen the board position, in FEN
 * @returns the data sent in response, if it is valid. empty string otherwise.
 */
async function fetchBestMove(fen: string): Promise<any> {
  try {
    let result = postJSON(`${PROXY}fen`, { fen: fen })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error();
        }
      })
      .then((data) => {
        // parse the move!!!
        if (data) {
          // console.log("AI replied: ", data);
          return data;
        }
      });

    return result;
  } catch (err) {
    console.log(err);
  }

  return "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MoveReply>
) {
  // then do handling of request
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const analysis = await fetchBestMove(req.body.fen);

        const bestMove = analysis.move;
        res.status(200).json({ move: bestMove });
      } catch (err) {
        console.log(err);
        res.status(400).json({ move: "" });
      }

      break;
  }
}
