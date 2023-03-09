import { QuestionDocument } from './schema/question.schema';
import { QuizQuestionEntity } from './entity/quiz.question.entity';

export abstract class IQuizQuestionsRepositorySa {
  abstract getQuestion(questionId: string);
  abstract save(question: QuestionDocument | QuizQuestionEntity);
  abstract deleteQuestionById(id: string);
  abstract getQuestionAllParameters(id: string);
}
