export interface QuestionContext {
  content: string;
}

export interface File {
  uid: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  contents: string;
  status: string;
}

export interface Context {
  id: string;
  questions: QuestionContext[];
  questionAnswers: Record<string, string[]>;
  files: File[];
  createAt: Date;
}
