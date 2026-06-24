import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { DatabaseModule } from '../db/database.module';
import { RedisModule } from '../redis/redis.module';
import { HealthModule } from '../health/health.module';
import { TestRunnerModule } from '../test-runner/test-runner.module';
import { ApplicationModule } from '../application/application.module';
import { CosmosModule } from '../cosmos/cosmos.module';

@Module({
  imports: [DatabaseModule, RedisModule, HealthModule, TestRunnerModule, ApplicationModule, CosmosModule],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
