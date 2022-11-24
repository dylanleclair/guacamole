import type { NextApiRequest, NextApiResponse } from "next";

import "../../../lib/databaseConnection";
import User, { type IUser } from "../../../models/User";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getSession } from "next-auth/react";

type Data = {};

enum ERROR_CODE {
  success,
  fail,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser | ERROR_CODE>
) {
  const { method } = req;

  const session = await getSession({ req });

  switch (method) {
    case "GET":
      try {
        const user = await User.findOne({ email: session?.user?.email });
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
    default:
      res.status(400).json(ERROR_CODE.fail);
      break;
  }
}
