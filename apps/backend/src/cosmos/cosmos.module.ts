import { Module } from '@nestjs/common';
import { CosmosService } from './cosmos.service';
import { CosmosController } from './cosmos.controller';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CosmosController],
  providers: [CosmosService],
  exports: [CosmosService],
})
export class CosmosModule {}
