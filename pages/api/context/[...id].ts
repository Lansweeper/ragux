import { getMongoClient } from "@/infrastructure/mongo";
import { contextService } from "@/services/context";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mongoDB = (await getMongoClient()).db(process.env.MONGODB_DATABASE);

  const { id } = req.query;
  const contextId = Array.isArray(id) ? id.at(0) : id;

  if (!contextId) {
    return res.status(400);
  }

  switch (req.method) {
    case "GET":
      const context = await contextService.getContextById(mongoDB, contextId);
      res.status(200).json({ result: context });
      break;
    case "DELETE":
      contextService.deleteContext(contextId, mongoDB);
      res.status(204).end();
      break;
    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
