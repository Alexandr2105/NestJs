import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ITestingRepository } from './i.testing.repository';

@Injectable()
export class TestingRepositorySql implements ITestingRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async deleteAllCollection() {
    await this.dataSource.query(`DELETE FROM public."EmailConfirmations"`);
    await this.dataSource.query(`DELETE FROM public."Blog"`);
    await this.dataSource.query(`DELETE FROM public."RefreshTokenData"`);
    await this.dataSource.query(`DELETE FROM public."Users"`);
    await this.dataSource.query(`DELETE FROM public."BanUsers"`);
  }
}
