// models/User.js

import mongoose from "mongoose";
import Match from "./Match";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  image: string;
  elo: number;
  currentMatch?: Object;
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  elo: Number,
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
