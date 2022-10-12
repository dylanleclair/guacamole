import type { NextApiRequest, NextApiResponse } from "next";

import "../../lib/databaseConnection";
import Match, { type IMatch } from "../../models/Match";
import { Chess } from 'chess.js'
import ChessUser from "../../models/User";
import { randomInt } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IMatch | {}>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const chess: Chess = new Chess();
        let moveCount = 0;
        console.log(chess.moves({ verbose: true })[0]);
        while (moveCount < 30) {
          const moves = chess.moves()
          const move = moves[Math.floor(Math.random() * moves.length)]
          chess.move(move)
          moveCount += 1;
        }

        res.status(200).json({ player1id: null, pgn: chess.pgn() });

        // const lol = await ChessUser.findOne({ email: "dylan.leclair@icloud.com" });
        // if (lol) {
        //   console.log(lol._id);

        //   const match = await Match.findOne({ player1id: lol._id.toString() });
        //   res.status(200).json(match);
        // } else {

        //   const match = Match.create({ player1id: lol._id.toString(), pgn: chess.pgn() });
        //   res.status(200).json(match);
        // }

      } catch (error) {
        console.log(error);
        res.status(400).json({});
      }
      break;
    case "POST":
      try {
        let chess = new Chess();
        for (let i = 0; i < 20; i++) {
          let index = randomInt(chess.moves().length);
          chess.move(chess.moves()[index]);
        }
        console.log(chess.pgn());
        // random chess game
        let m = Match.create({
          player1id: '632a1a8b180d94e0b9e65d09',
          player2id: '',
          pgn: chess.pgn(),
        });
        m.then((data) => {
          res.status(200).json(data);
        }
        );

      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
  }


}
