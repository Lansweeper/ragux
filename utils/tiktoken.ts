import { get_encoding, encoding_for_model } from "tiktoken";

const ENCODING_NAME = "cl100k_base";

export const numTokensFromString = (text: string): number => {
  const encoding = get_encoding(ENCODING_NAME);
  return encoding.encode(text).length;
};
