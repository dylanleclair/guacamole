// models/User.js

import mongoose, { Mongoose } from "mongoose";

export interface IMatchRequest extends mongoose.Document {
  playerid: mongoose.Schema.Types.ObjectId;
  elo: number;
}

const MatchRequestSchema = new mongoose.Schema({
  playerid: { type: mongoose.Schema.Types.ObjectId, required: true },
  elo: { type: Number, required: true },
});

export default mongoose.models.MatchRequest ||
  mongoose.model<IMatchRequest>("MatchRequest", MatchRequestSchema);
