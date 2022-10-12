// models/User.js

import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  image: string;
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
