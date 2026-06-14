import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ScopedAnuncioRepository } from './scoped-anuncio.repository';
import { TenantModule } from '../tenant/tenant.module';

@Global()
@Module({
  imports: [TenantModule],
  providers: [DatabaseService, ScopedAnuncioRepository],
  exports: [DatabaseService, ScopedAnuncioRepository],
})
export class DatabaseModule {}
