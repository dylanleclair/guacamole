import type { NextApiRequest, NextApiResponse } from "next";

import "../../lib/databaseConnection";
import Match, { type IMatch } from "../../models/Match";
import { Chess } from 'chess.js'
import ChessUser from "../../models/User";
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
        let m = await Match.create<IMatch>({
          player1id: new ObjectId('6346e3c2eef101eb4eb8e65e'),
          player2id: new ObjectId('635706046bc4c9602b6a8ffd'),
          pgn: chess.pgn(),
          ongoing: true
        });

        if (m) {
          res.status(200).json(m);
        }

      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "PATCH":
      try {

        console.log("MESSAGE BODY:")
        console.log(JSON.parse(req.body));


        let data = JSON.parse(req.body);

        let id: string = data.game
        let move: string = data.move;

        // find the match

        let matchId = new ObjectId(id);
        let m = await Match.findOne<IMatch>({ _id: matchId }).exec();

        if (m) {
          // make the move sent to endpoint
          console.log("found a match!");
          let game = new Chess();
          game.loadPgn(m.pgn);
          game.move(move);

          // update database!
          Match.where({ _id: matchId }).update({ pgn: game.pgn() }).exec().then(() => {
            console.log("match updated!");
            res.status(200);

          });



        } else {
          res.status(400);

        }

      } catch (error) {
        res.status(400).json({ success: false });
      }
  }


}
