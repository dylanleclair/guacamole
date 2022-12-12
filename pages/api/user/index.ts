import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import User, { type IUser } from "../../../models/User";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser | string>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { method } = req;

  if (!session) {
    res.status(401).json("You must be authorized to make this request.");
    return;
  }

  switch (method) {
    case "GET":
      try {
        const user = await User.findOne({ _id: session.user?.id });
        console.log(user);
        res.status(200).json(user);
      } catch (error) {
        res.status(400).json("Unable to find user " + error);
      }
      break;
    case "POST":
      try {
        await User.create(req.body);
        res.status(201).json("User created successfully");
      } catch (error) {
        res.status(400).json("Unable to create user " + error);
      }
      break;
    case "PUT":
      try {
        await User.updateOne({ _id: session.user?.id }, req.body);
        res.status(200).json("User updated successfully");
      } catch (error) {
        res.status(400).json("Unable to update user " + error);
      }
      break;
    default:
      res.status(400).json("Unsupported operation");
      break;
  }
}
