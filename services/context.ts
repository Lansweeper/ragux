import { Context } from "@/model/context";
import { Db } from "mongodb";
import { interviewTranscriptionEmbeddingService } from "./interviewTranscriptionEmbedding.service";

const getCollection = (mongoDB: Db) => {
  return mongoDB.collection<Context>("ragux_contexts");
};

export async function getContexts(mongoDB: Db): Promise<Context[] | null> {
  const allContexts = await getCollection(mongoDB)
    .find()
    .sort({ name: 1, createAt: 1 })
    .toArray();
  if (!allContexts) {
    return null;
  }
  return allContexts;
}

export async function getContextById(
  mongoDB: Db,
  contextId: string
): Promise<Context | null> {
  const context = await getCollection(mongoDB).findOne({
    id: contextId,
  });
  if (!context) {
    return null;
  }
  return context;
}

export async function createContext(
  context: Context,
  mongoDB: Db
): Promise<Context> {
  const contextInserted = await getCollection(mongoDB).insertOne({
    ...context,
    createAt: new Date(),
  });
  if (!contextInserted) {
    throw new Error("Error while inserting context");
  }
  return {
    ...context,
  };
}

export async function deleteContext(
  contextId: string,
  mongoDB: Db
): Promise<void> {
  await getCollection(mongoDB).deleteOne({ id: contextId });
  await interviewTranscriptionEmbeddingService.deleteEmbeddingsByContext(
    contextId
  );
}

export async function getLastContext(mongoDB: Db): Promise<Context | null> {
  const context = await getCollection(mongoDB)
    .find()
    .sort({ createAt: -1 })
    .limit(1)
    .toArray();
  if (!context) {
    return null;
  }
  return context[0];
}

export const contextService = {
  getContextById,
  getContexts,
  deleteContext,
  createContext,
  getLastContext,
};
