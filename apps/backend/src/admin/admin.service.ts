import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { usuarios, anuncios, lojas, produtos } from '@precoreal/shared';
import { sql, eq, and, gte, desc } from 'drizzle-orm';

@Injectable()
export class AdminService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async dashboard() {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [userCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(usuarios)
      .where(gte(usuarios.criadoEm, trintaDiasAtras));

    const [ofertaCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(anuncios);

    const [lojaCount] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(lojas)
      .where(gte(lojas.criadoEm, trintaDiasAtras));

    return {
      usuariosAtivos: Number(userCount?.total || 0),
      totalOfertas: Number(ofertaCount?.total || 0),
      novasLojas: Number(lojaCount?.total || 0),
    };
  }

  async monitoramentoPrecos(
    produtoId?: string,
    regiao?: string,
    _periodo?: string,
  ) {
    const query = this.db
      .select({
        data: produtos.criadoEm,
        precoMedio: produtos.precoMedio,
        regiao: lojas.enderecoEstado,
      })
      .from(produtos)
      .innerJoin(anuncios, eq(anuncios.produtoId, produtos.id))
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .where(
        and(
          produtoId ? eq(produtos.id, produtoId) : sql`1=1`,
          regiao ? eq(lojas.enderecoEstado, regiao) : sql`1=1`,
        ),
      )
      .orderBy(desc(produtos.criadoEm))
      .limit(100);

    const pontos = (await query).map((p) => ({
      data: p.data?.toISOString() || new Date().toISOString(),
      precoMedio: p.precoMedio,
      regiao: p.regiao,
    }));

    return { pontos };
  }

  async monitoramentoUso(_periodo?: string) {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usuariosPorDia = await this.db
      .select({
        data: sql<string>`DATE(${usuarios.criadoEm})`,
        total: sql<number>`count(*)`,
      })
      .from(usuarios)
      .where(gte(usuarios.criadoEm, trintaDiasAtras))
      .groupBy(sql`DATE(${usuarios.criadoEm})`)
      .orderBy(sql`DATE(${usuarios.criadoEm})`);

    const topProdutos = await this.db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,
        totalBuscas: sql<number>`count(*)`,
      })
      .from(anuncios)
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(gte(anuncios.criadoEm, trintaDiasAtras))
      .groupBy(produtos.id, produtos.nome)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      volumeBuscas: usuariosPorDia.map((d) => ({
        data: d.data,
        total: Number(d.total),
      })),
      produtosMaisBuscados: topProdutos.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        totalBuscas: Number(p.totalBuscas),
      })),
      engajamento: usuariosPorDia.map((d) => ({
        data: d.data,
        usuariosAtivos: Number(d.total),
      })),
    };
  }
}
