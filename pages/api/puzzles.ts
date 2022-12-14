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


        Puzzle.count().exec(function(err, count){

        var random = Math.floor(Math.random() * count); // generate a random puzzle index

        Puzzle.findOne<IPuzzle>().skip(random).exec( // select the random-th puzzle from the DB 
            function (err, p) {

            // result is random 
            if (p)
            {
                res.status(200).json(p);

            } else throw Error("Could not fetch any puzzles.");

        });

        });

      } catch (error) {
        console.log(error);
        res.status(400).json({});
      }
      break;
    
    /**
     * Endpoint that receives puzzles from external puzzle generators.
     */
    case "POST":
      console.log("RECEIVED PUZZLE")
    let puzzle = req.body;
      console.log(puzzle);
      try {
        let puzzle = req.body;

        // simple parsing of data into puzzle object
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
