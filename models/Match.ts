// models/User.js

import mongoose, { Mongoose } from "mongoose";

export interface IMatch extends mongoose.Document {
    player1id: string;
    player2id?: string;
    pgn: string;
}

const MatchSchema = new mongoose.Schema({
    player1id: { type: String, required: true },
    player2id: { type: String, required: false },
    pgn: { type: String, required: true },
});

export default mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
