import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { DatabaseModule } from '../db/database.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
