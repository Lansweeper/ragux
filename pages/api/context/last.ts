import type { NextApiRequest, NextApiResponse } from "next";

import { getMongoClient } from "@/infrastructure/mongo";
import { contextService } from "@/services/context";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    result: any;
  }>
) {
  const mongoDB = (await getMongoClient()).db(process.env.MONGODB_DATABASE);

  switch (req.method) {
    case "GET":
      const contexts = await contextService.getLastContext(mongoDB);
      res.status(200).json({ result: contexts });
      break;
    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
