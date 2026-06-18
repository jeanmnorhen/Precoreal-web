import { Injectable, Inject } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';

@Injectable()
export class MonitorarPrecosUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(input?: { produtoId?: string; regiao?: string }) {
    const pontos = await this.produtoRepo.getPrecoHistory(input?.produtoId, input?.regiao);
    return { pontos };
  }
}
