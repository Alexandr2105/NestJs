import { QuestionDocument } from './schema/question.schema';

export abstract class IQuizQuestionsRepositorySa {
  abstract getQuestion(questionId: string);
  abstract save(question: QuestionDocument);
  abstract deleteQuestionById(id: string);
}
