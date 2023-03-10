import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint()
@Injectable()
export class CheckArrayCorrectAnswer implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return 'Не верные данные';
  }

  validate(array: any) {
    for (const a of array) {
      if ((a + '').trim().length < 1) {
        return false;
      }
    }
    return true;
  }
}
