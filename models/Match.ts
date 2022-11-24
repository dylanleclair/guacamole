// models/User.js

import mongoose, { Mongoose } from "mongoose";

export interface IMatch extends mongoose.Document {
  player1id: mongoose.Schema.Types.ObjectId;
  player2id?: mongoose.Schema.Types.ObjectId;
  pgn: string;
  ongoing: boolean;
  winner: mongoose.Schema.Types.ObjectId;
}

const MatchSchema = new mongoose.Schema({
  player1id: { type: mongoose.Schema.Types.ObjectId, required: true },
  player2id: { type: mongoose.Schema.Types.ObjectId, required: false },
  pgn: { type: String, required: true },
  ongoing: { type: Boolean, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, required: false },
});

export default mongoose.models.Match ||
  mongoose.model<IMatch>("Match", MatchSchema);
