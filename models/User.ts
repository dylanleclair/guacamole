// models/User.js

import mongoose from "mongoose";
import Match from "./Match";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  image: string;
  elo?: number;
  premiumMember?: boolean;
  currentMatch?: Object;
  boardLightColor?: string;
  boardDarkColor?: string;
  stripeCustomerId?: string;
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  elo: Number,
  premiumMember: Boolean,
  boardLightColor: String,
  boardDarkColor: String,
  stripeCustomerId: String,
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
