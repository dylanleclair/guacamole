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
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const user = await User.findOne({ _id: req.body.id });
        console.log(req.body);
        console.log(user);
        res.status(200).json(user);
      } catch (error) {
        res.status(400).json(ERROR_CODE.fail);
      }
      break;
  }
}
