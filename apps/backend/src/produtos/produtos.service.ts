import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '@precoreal/domain';
import type { IProdutoRepository } from '@precoreal/domain';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepository: IProdutoRepository,
  ) {}

  async create(dto: CreateProdutoDto) {
    const existing = await this.produtoRepository.findByCodigoBarras(dto.codigoBarras);

    if (existing) {
      throw new ConflictException(
        'Produto com este código de barras já existe.',
      );
    }

    return this.produtoRepository.create(dto as any);
  }

  async findAll(search?: string) {
    if (search) {
      return this.produtoRepository.search(search);
    }

    return this.produtoRepository.findAll();
  }

  async findByCodigoBarras(codigoBarras: string) {
    return this.produtoRepository.findByCodigoBarras(codigoBarras);
  }

  async findById(id: string) {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  async update(id: string, dto: UpdateProdutoDto) {
    const produto = await this.produtoRepository.update(id, dto as any);
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  async delete(id: string) {
    const produto = await this.produtoRepository.delete(id);
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }
}
