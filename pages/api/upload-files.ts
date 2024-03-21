import type { NextApiRequest, NextApiResponse } from "next";
import { openai, MODEL } from "../../infrastructure/openAI";

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    console.log("HERE");
    const files: File[] = JSON.parse(req.body);
    const questions = [
      "Based on all the user research, what are our biggest UX challenges",
      "Where are the gaps in our product",
      "Is there a common target audience based on the people we have interviewed so far, if so can you describe the common traits?",
    ];

    // TODO: Handle file uploads
    await new Promise((r) => setTimeout(r, 2000));

    res.status(200).json(files);
  } else {
    res.status(405).json({ message: "Only POST requests are allowed" });
  }
}
