import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../features/sa/users/entity/user.entity';

@Entity()
export class EmailConfirmationEntity {
  @PrimaryColumn()
  userId: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
