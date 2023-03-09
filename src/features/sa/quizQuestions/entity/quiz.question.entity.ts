import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class QuizQuestionEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  body: string;
  @Column({ type: 'json' })
  correctAnswers: [];
  @Column()
  published: boolean;
  @Column()
  createdAt: string;
  @Column({ default: null })
  updatedAt: string;
}
