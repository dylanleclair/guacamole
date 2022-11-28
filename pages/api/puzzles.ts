import type { NextApiRequest, NextApiResponse } from "next";

import "../../lib/databaseConnection";
import Puzzle, { type IPuzzle } from "../../models/Puzzle";
import { Chess } from "chess.js";
import { ObjectId } from "mongodb";
import { match } from "assert";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPuzzle | {}>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const chess: Chess = new Chess();
        let moveCount = 0;
        console.log(chess.moves({ verbose: true })[0]);
        while (moveCount < 30) {
          const moves = chess.moves();
          const move = moves[Math.floor(Math.random() * moves.length)];
          chess.move(move);
          moveCount += 1;
        }

        res.status(200).json({ player1id: null, pgn: chess.pgn() });
      } catch (error) {
        console.log(error);
        res.status(400).json({});
      }
      break;
    
    case "POST":
      console.log("RECEIVED PUZZLE")
    let puzzle = req.body;
      console.log(puzzle);
      try {
        let puzzle = req.body;

        let p = await Puzzle.create({expected_line: puzzle.expected_line, start_position: puzzle.start_position});        

        if (p) {

            console.log("Adding new puzzle!");
            console.log(p);
            
            // return the puzzle
            res.status(200).json({});
        }
      } catch (err)
      {
        res.status(400).json({});
      }
      break;

  }
}
