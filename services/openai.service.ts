import { openai, MODEL } from "@/infrastructure/openAI";
import { File } from "@/model/context";
import { chunkText, cleanVttTokens } from "@/utils/tiktoken";

const answerContextQuestions = async (files: File[], questions: string[]) => {
  console.log(`0/${files.length}`);
  let count = 0;
  const answerPromises: Promise<Record<string, string>[]>[] = [];
  for (const file of files) {
    const cleanText = cleanVttTokens(
      Buffer.from(file.contents, "base64").toString()
    );
    const textChunks = await chunkText(cleanText);

    const answers = [];
    for (const chunk of textChunks) {
      const response = await openai.chat.completions.create({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You will be provided with an array of questions that you must answer." +
              "The response should be a JSON composed with the question title unmodified as the key and the answer to the question as the value." +
              "If the answer is not present in the context return an empty string." +
              "To respond, you must base it on the following interview transcript: \n" +
              chunk,
          },
          {
            role: "user",
            content: JSON.stringify(questions),
          },
        ],
      });

      answers.push(response);
    }

    count++;
    console.log(`${count}/${files.length}`);
    const parsedAnswers = answers.map((answer) =>
      JSON.parse(answer.choices[0].message.content as string)
    );
    const fileAnswers = parsedAnswers.reduce((acc, answer) => {
      Object.entries(answer).forEach(([question, answer]) => {
        if (!acc[question]) {
          acc[question] = [];
        }
        acc[question] += answer;
      });
      return acc;
    }, {} as Record<string, string[]>);
    answerPromises.push(fileAnswers);
  }

  return answerPromises;
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
