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
  if (req.method === "POST") {
    const {
      prompt,
      contextId,
    }: {
      prompt: string;
      contextId: string;
    } = req.body;

    const vector = await openai.embeddings.create({
      input: prompt,
      model: EMBEDDING_MODEL,
      encoding_format: "float",
    });

    const embeddings =
      await interviewTranscriptionEmbeddingService.findEmbeddings({
        queryVector: vector.data[0].embedding,
        contextId: contextId,
      });

    const context = [];
    let totalTokens = 0;

    for (const embedding of embeddings) {
      totalTokens += await numTokensFromString(embedding.content);

      if (totalTokens < MAX_TOKENS) {
        context.push(embedding.content);
      } else {
        break;
      }
    }
    const completion = await openAIService.contextSystemPropmt(context, prompt);

    res.status(200).json({ answer: completion.choices[0].message.content });
  } else {
    res.status(405).json({ answer: "Only GET requests are allowed" });
  }
}
