import { UsersModel } from './allTypes';

declare global {
  declare namespace Express {
    export interface Request {
      user: UsersModel | null;
    }
  }
}
