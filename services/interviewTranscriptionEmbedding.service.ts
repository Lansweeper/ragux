import { getClickhouseClient } from "@/infrastructure/clickhouse";
import { EnterviewTranscriptionEmbedding } from "@/model/clickhouse";

const DB = "hackaton_ragux";
const INTERVIEW_TRANSCRIPTION_EMBEDDING_TABLE = `${DB}.interview_transcription_embedding`;

const FIND_EMBEDDINGS_QUERY = `
SELECT 
    content,
    <<distanceFn>>(embedding, [<<queryVector>>]) as distance
FROM ${INTERVIEW_TRANSCRIPTION_EMBEDDING_TABLE}
WHERE contextId = '<<contextId>>' AND distance <= <<minDistance>>
ORDER BY distance ASC
LIMIT <<limit>>
`;

const findEmbeddings = async ({
  queryVector,
  contextId,
  limit = 10,
  minDistance = 1,
}: {
  queryVector: number[];
  contextId: string;
  limit?: number;
  minDistance?: number;
}): Promise<EnterviewTranscriptionEmbedding[]> => {
  const chClient = await getClickhouseClient();
  const query = FIND_EMBEDDINGS_QUERY.replace(
    /<<queryVector>>/g,
    queryVector.join(",")
  )
    .replace(/<<distanceFn>>/g, "cosineDistance")
    .replace(/<<minDistance>>/g, minDistance.toString())
    .replace(/<<contextId>>/g, contextId)
    .replace(/<<limit>>/g, limit.toString());
  console.log(query);
  const result = await chClient.query({ query });
  const jsonResult = await result.json<{
    data: EnterviewTranscriptionEmbedding[];
  }>();

  return jsonResult.data;
};

const insertEmbeddings = async (
  embeddings: EnterviewTranscriptionEmbedding[]
): Promise<void> => {
  const chClient = await getClickhouseClient();
  await chClient.insert<EnterviewTranscriptionEmbedding>({
    table: INTERVIEW_TRANSCRIPTION_EMBEDDING_TABLE,
    values: embeddings,
    format: "JSONEachRow",
  });
};

const deleteEmbeddingsByContextId = async (
  contextId: string
): Promise<void> => {
  const chClient = await getClickhouseClient();
  await chClient.query({
    query: `DELETE FROM ${INTERVIEW_TRANSCRIPTION_EMBEDDING_TABLE} WHERE contextId = '${contextId}'`,
  });
};

const deleteEmbeddingsByDocTitle = async (docTitle: string): Promise<void> => {
  const chClient = await getClickhouseClient();
  await chClient.query({
    query: `DELETE FROM ${INTERVIEW_TRANSCRIPTION_EMBEDDING_TABLE} WHERE docTitle = '${docTitle}'`,
  });
};

export const interviewTranscriptionEmbeddingService = {
  findEmbeddings,
  insertEmbeddings,
  deleteEmbeddingsByContext: deleteEmbeddingsByContextId,
  deleteEmbeddingsByDocTitle,
};
