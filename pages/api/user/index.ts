import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import User, { type IUser } from "../../../models/User";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

enum ERROR_CODE {
  success,
  fail,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser | ERROR_CODE>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { method } = req;

  if (!session) {
    res.status(401).json(ERROR_CODE.fail);
    return;
  }

  switch (method) {
    case "GET":
      try {
        const user = await User.findOne({ _id: session.user?.id });
        console.log(user);
        res.status(200).json(user);
      } catch (error) {
        res.status(400).json(ERROR_CODE.fail);
      }
      break;
    case "POST":
      try {
        const user: IUser = await User.create(req.body);
        res.status(201).json(ERROR_CODE.fail);
      } catch (error) {
        res.status(400).json(ERROR_CODE.fail);
      }
      break;
    case "PUT":
      try {
        await User.updateOne({ _id: session.user?.id }, req.body);
        res.status(200).json(ERROR_CODE.fail);
      } catch (error) {
        res.status(400).json(ERROR_CODE.fail);
      }
    default:
      res.status(400).json(ERROR_CODE.fail);
      break;
  }
}
