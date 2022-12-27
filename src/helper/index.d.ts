import { User } from '../users/schema/user';

declare global {
  declare namespace Express {
    export interface Request {
      user: User | null;
    }
  }
}
