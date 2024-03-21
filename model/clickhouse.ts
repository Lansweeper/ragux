// PK: contextId, docTitle, index
export interface EnterviewTranscriptionEmbedding {
  contextId: string;
  docTitle: String;
  index: number;
  registryCreatedAt: Date;
  content: string;
  embedding: number[];
}
