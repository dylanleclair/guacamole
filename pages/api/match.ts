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
        // for (let i = 0; i < 20; i++) {
        //   let index = randomInt(chess.moves().length);
        //   chess.move(chess.moves()[index]);
        // }
        // console.log(chess.pgn());

        console.log(req.body.playerid);


        // random chess game
        let m = await Match.create<IMatch>({
          player1id: new ObjectId(req.body.playerid),
          pgn: chess.pgn(),
          ongoing: false,
        });

        if (m) {
          res.status(200).json(m);
        }

      } catch (error) {
        console.log(error);
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

        // else, try and make the move normally
        let matchId = new ObjectId(id);
        let m = await Match.findOne<IMatch>({ _id: matchId }).exec();

        if (m) {
          // if player resigned, update winner & exit.

          console.log("found the match!");

          // check if the game has been surrendered
          if (move.includes("resigns")) {
            console.log('PLAYER HAS RESIGNED:', move);
            let winner = move.split(" ")[0];
            // if white, player1 wins
            // if black, player2 wins
            let winnerId = m.player1id;
            if (winner === "black") {
              if (m.player2id) {
                winnerId = m.player2id
              }
            }

            await Match.where({ _id: matchId }).update({ winner: winnerId, ongoing: false }).exec().then(() => {
              res.status(200).json(move);
            });
            return;
          }

          // else, 
          // make the move sent to endpoint normally
          let game = new Chess();

          // try to load the game according to pgn in database
          game.loadPgn(m.pgn);
          // try and make the move being posted
          let validMove = game.move(move);

          if (validMove) {
            // update database!
            await Match.where({ _id: matchId }).update({ pgn: game.pgn() }).exec().then(() => {
              res.status(200).json({ ...m, pgn: game.pgn() });
            });
          } else {
            throw new Error("Move could not be handled by API.")
          }


        } else {
          throw new Error("Match could not be found in database.")
        }

      } catch (error) {
        res.status(400).json({ success: false });
      }
  }


}
