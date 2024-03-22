import { openai, MODEL } from "@/infrastructure/openAI";
import { File } from "@/model/context";

const decodeBase64 = (text: string) => {
  return atob(text);
};

const answerContextQuestions = async (files: File[], questions: string[]) => {
  const answerPromises = files.map(async (file) => {
    const answer = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You will be provided with an array of questions that you must answer." +
            "The response should be a JSON composed with the question title unmodified as the key and the answer to the question as the value." +
            "To respond, you must base it on the following interview transcript: \n" +
            Buffer.from(file.contents, "base64"),
        },
        {
          role: "user",
          content: JSON.stringify(questions),
        },
      ],
    });
    return JSON.parse(answer.choices[0].message.content as string);
  });

  return Promise.all(answerPromises) as Promise<Record<string, string>[]>;
};

const contextSystemPropmt = (context: string[], prompt: string) =>
  openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          `You are a helpful chat assistant who helps our UX team query video transcripts that are user interviews. \n` +
          `You must follow this rules: \n` +
          `Do not answer if the if the solution is not provided in the context and politely ask them a question related to the product.\n` +
          `Answer the question based on the context below: \n` +
          context.join(`\n`),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

export const openAIService = {
  answerContextQuestions,
  contextSystemPropmt,
};
