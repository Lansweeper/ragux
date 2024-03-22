import { Db } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

import { getMongoClient } from "@/infrastructure/mongo";
import { Context, File } from "@/model/context";
import { openAIService } from "@/services/openai.service";
import { interviewTranscriptionEmbeddingService } from "@/services/interviewTranscriptionEmbedding.service";
import { contextService } from "@/services/context";
import { openai, EMBEDDING_MODEL } from "@/infrastructure/openAI";
import { EnterviewTranscriptionEmbedding } from "@/model/clickhouse";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    result: any;
  }>
) {
  const mongoDB = (await getMongoClient()).db(process.env.MONGODB_DATABASE);

  switch (req.method) {
    case "GET":
      const contexts = await contextService.getContexts(mongoDB);
      res.status(200).json({ result: contexts });
      break;
    case "POST":
      const newContext: Context = req.body;
      newContext.id = crypto.randomUUID();
      const constexAnswers = await openAIService.answerContextQuestions(
        newContext.files,
        newContext.questions.map((question) => question.content)
      );
      const answersByQuestion = constexAnswers.reduce((acc, answer) => {
        Object.entries(answer).forEach(([question, answer]) => {
          if (!acc[question]) {
            acc[question] = [];
          }
          acc[question].push(answer);
        });
        return acc;
      }, {} as Record<string, string[]>);

      const context = await contextService.createContext(
        { ...newContext, questionAnswers: answersByQuestion },
        mongoDB
      );
      const vectors = await Promise.all(
        Object.entries(answersByQuestion).map(
          async ([question, answers], index) => {
            const content = `Question: ${question}\nAnswers: ${answers.join(
              "\n"
            )}`;
            const vector = await openai.embeddings.create({
              input: content,
              model: EMBEDDING_MODEL,
              encoding_format: "float",
            });
            return {
              content: content,
              contextId: context.id,
              docTitle: question,
              embedding: vector.data[0].embedding,
              index: 0,
              registryCreatedAt: new Date(),
            } as EnterviewTranscriptionEmbedding;
          }
        )
      );
      await interviewTranscriptionEmbeddingService.insertEmbeddings(vectors);
      res.status(200).json({ result: context });
      break;
    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
