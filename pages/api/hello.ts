// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react"
import { userInfo } from 'os';
type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req });

  if (session) {
    res.status(200).json({ message: session.user?.name! });
  } else {
    res.status(400).json({ message: "This API endpoint is restricted to logged in users." });
  }
}
