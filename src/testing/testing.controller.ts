import { Controller, Delete, Inject, Res } from '@nestjs/common';
import { TestingRepository } from './testing.repository';

@Controller('testing')
export class TestingController {
  constructor(
    @Inject(TestingRepository) protected testingRepository: TestingRepository,
  ) {}

  @Delete('all-data')
  async deleteAllBase(@Res() res) {
    await this.testingRepository.deleteAllCollection();
    res.sendStatus(204);
  }
}
