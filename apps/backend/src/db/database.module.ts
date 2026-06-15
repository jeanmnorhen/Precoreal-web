import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TenantModule } from '../tenant/tenant.module';

@Global()
@Module({
  imports: [TenantModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
