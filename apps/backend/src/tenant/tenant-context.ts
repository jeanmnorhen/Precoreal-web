import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  private currentTenantId?: string;

  constructor(@Inject(REQUEST) private request: any) {
    // Tenta extrair o ID do inquilino (lojaId) do JWT decodificado (request.user)
    // ou do cabeçalho da requisição (para fins administrativos/testes)
    const rawUser = this.request?.user;
    this.currentTenantId = rawUser?.lojaId || this.request?.headers?.['x-tenant-id'];
  }

  get tenantId(): string {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID não configurado no escopo da requisição.');
    }
    return this.currentTenantId;
  }

  set tenantId(id: string) {
    this.currentTenantId = id;
  }

  get hasTenant(): boolean {
    return !!this.currentTenantId;
  }
}
