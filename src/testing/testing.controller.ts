import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ITestingRepository } from './i.testing.repository';

@Controller('testing')
export class TestingController {
  constructor(protected testingRepository: ITestingRepository) {}

  @HttpCode(204)
  @Delete('all-data')
  async deleteAllBase() {
    await this.testingRepository.deleteAllCollection();
  }
}
