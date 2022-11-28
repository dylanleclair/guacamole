// models/User.js

import mongoose from "mongoose";


export interface IPuzzle extends mongoose.Document {
    start_position: string;
    expected_line: string[];
}

const PuzzleSchema = new mongoose.Schema({
    expected_line: [String],
    start_position: String,
});

export default mongoose.models.Puzzle ||
  mongoose.model<IPuzzle>("Puzzle", PuzzleSchema);
