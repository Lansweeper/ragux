import { Tiktoken } from "tiktoken/lite";
import { load } from "tiktoken/load";

const models = require("tiktoken/model_to_encoding.json");
const registry = require("tiktoken/registry.json");

export const numTokensFromString = async (text: string): Promise<number> => {
  const model = await load(registry[models["gpt-3.5-turbo"]]);
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );
  const numTokens = encoder.encode(text).length;
  encoder.free();
  return numTokens;
};

export const chunkText = async (
  text: string,
  maxTokens: number = 8000
): Promise<string[]> => {
  const model = await load(registry[models["gpt-3.5-turbo"]]);
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );

  const sentences = text.split("\n");
  const nTokens = sentences.map((sentence) => encoder.encode(sentence).length);
  let chunks: string[] = [];
  let tokensSoFar = 0;
  let chunk: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const token = nTokens[i];

    if (tokensSoFar + token > maxTokens) {
      chunks.push(chunk.join(". ") + ".");
      chunk = [];
      tokensSoFar = 0;
    }

    if (token > maxTokens) {
      continue;
    }

    chunk.push(sentence);
    tokensSoFar += token + 1;
  }
  encoder.free();
  return chunks;
};

export const cleanVttTokens = (text: string): string => {
  return text
    .split("\n")
    .filter((line) => !line.includes("-->"))
    .filter((line) => line.trim() !== "")
    .join("\n");
};
