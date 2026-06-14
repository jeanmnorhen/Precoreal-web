import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { produtos } from '@precoreal/shared';
import { eq, like, or } from 'drizzle-orm';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async create(dto: CreateProdutoDto) {
    const existing = await this.db
      .select()
      .from(produtos)
      .where(eq(produtos.codigoBarras, dto.codigoBarras))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        'Produto com este código de barras já existe.',
      );
    }

    const [produto] = await this.db.insert(produtos).values(dto).returning();

    return produto;
  }

  async findAll(search?: string) {
    if (search) {
      return this.db
        .select()
        .from(produtos)
        .where(
          or(
            like(produtos.nome, `%${search}%`),
            like(produtos.codigoBarras, `%${search}%`),
            like(produtos.marca, `%${search}%`),
            like(produtos.categoria, `%${search}%`),
          ),
        )
        .limit(50);
    }

    return this.db.select().from(produtos).limit(50);
  }

  async findByCodigoBarras(codigoBarras: string) {
    const [produto] = await this.db
      .select()
      .from(produtos)
      .where(eq(produtos.codigoBarras, codigoBarras))
      .limit(1);

    return produto || null;
  }

  async findById(id: string) {
    const [produto] = await this.db
      .select()
      .from(produtos)
      .where(eq(produtos.id, id))
      .limit(1);

    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  async update(id: string, dto: UpdateProdutoDto) {
    const [produto] = await this.db
      .update(produtos)
      .set(dto)
      .where(eq(produtos.id, id))
      .returning();

    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  async delete(id: string) {
    const [produto] = await this.db
      .delete(produtos)
      .where(eq(produtos.id, id))
      .returning();

    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }
}
