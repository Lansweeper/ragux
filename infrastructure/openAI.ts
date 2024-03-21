import OpenAI from "openai";

export const MODEL = "gpt-3.5-turbo";
export const EMBEDDING_MODEL = "text-embedding-3-large";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
