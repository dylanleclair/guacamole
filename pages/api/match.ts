import type { NextApiRequest, NextApiResponse } from "next";

import "../../lib/databaseConnection";
import Match, { type IMatch } from "../../models/Match";
import { Chess } from "chess.js";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IMatch | {}>
) {
  const { method } = req;

  switch (method) {
    case "PATCH":
      try {
        // console.log("MESSAGE BODY:");
        // console.log(JSON.parse(req.body));

        let data = JSON.parse(req.body);

        let id: string = data.game;
        let move: string = data.move;

        // else, try and make the move normally
        let matchId = new ObjectId(id);
        let m = await Match.findOne<IMatch>({ _id: matchId }).exec();

        if (m) {
          // if player resigned, update winner & exit.

          // console.log("found the match!");

          // check if the game has been surrendered
          if (move.includes("resigns")) {
            // console.log("PLAYER HAS RESIGNED:", move);
            let loser = move.split(" ")[0]; // the color in the string resigns, so they are the loser!
            // if white, player1 wins
            // if black, player2 wins
            let winnerId = m.player2id;
            if (loser === "black") {
              if (m.player1id) {
                winnerId = m.player1id;
              }
            }

            await Match.where({ _id: matchId })
              .update({ winner: winnerId, ongoing: false })
              .exec()
              .then(() => {
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
          let playerColor = game.turn();
          let validMove = game.move(move);

          if (validMove) {
            console.log("MOVE: ", move);

            if (game.isGameOver()) {
              if (game.isCheckmate()) {
                // there is a decisive winner
                let winner = playerColor === "b" ? m.player2id : m.player1id;
                // update database!
                await Match.where({ _id: matchId })
                  .update({ pgn: game.pgn(), ongoing: false, winner: winner })
                  .exec()
                  .then(() => {
                    res
                      .status(200)
                      .json({ ...m, pgn: game.pgn(), winner: winner });
                  });
              } else {
                // match is a draw
                // update database!
                await Match.where({ _id: matchId })
                  .update({ pgn: game.pgn(), ongoing: false })
                  .exec()
                  .then(() => {
                    res.status(200).json({ ...m, pgn: game.pgn() });
                  });
              }
            } else {
              // update database!
              await Match.where({ _id: matchId })
                .update({ pgn: game.pgn() })
                .exec()
                .then(() => {
                  res.status(200).json({ ...m, pgn: game.pgn() });
                });
            }
          } else {
            throw new Error("Move could not be handled by API.");
          }
        } else {
          throw new Error("Match could not be found in database.");
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false });
      }
  }
}
