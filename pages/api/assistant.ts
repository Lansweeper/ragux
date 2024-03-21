import type { NextApiRequest, NextApiResponse } from "next";
import { openai, EMBEDDING_MODEL } from "../../infrastructure/openAI";
import { openAIService } from "@/services/openai.service";
import { numTokensFromString } from "@/utils/tiktoken";
import { interviewTranscriptionEmbeddingService } from "@/services/interviewTranscriptionEmbedding.service";

const MAX_TOKENS = 16385;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ answer: string | null }>
) {
  if (req.method === "GET") {
    const body: {
      prompt: string;
      contextId: string;
    } = JSON.parse(req.body);

    const vector = await openai.embeddings.create({
      input: body.prompt,
      model: EMBEDDING_MODEL,
      encoding_format: "float",
    });

    const embeddings =
      await interviewTranscriptionEmbeddingService.findEmbeddings({
        queryVector: vector.data[0].embedding,
        contextId: body.contextId,
      });

    const context = [];
    let totalTokens = 0;

    for (const embedding of embeddings) {
      totalTokens += numTokensFromString(embedding.content);
      if (totalTokens < MAX_TOKENS) {
        context.push(embedding.content);
      } else {
        break;
      }
    }

    const completion = await openAIService.contextSystemPropmt(context);

    res.status(200).json({ answer: completion.choices[0].message.content });
  } else {
    res.status(405).json({ answer: "Only GET requests are allowed" });
  }
}
