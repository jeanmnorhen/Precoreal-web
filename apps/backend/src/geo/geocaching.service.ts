import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { RedisService } from '../redis/redis.service';
import { Geohash } from './geohash';
import { anuncios, lojas, produtos } from '@precoreal/shared';
import { eq, and, sql } from 'drizzle-orm';

export interface NearbyAdResult {
  id: string;
  titulo: string;
  distancia: number;
  lojaNome: string;
  produtoNome: string;
  codigoBarras: string;
  precoMedio: number;
}

@Injectable()
export class GeocachingService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  private get db() {
    return this.dbService.database;
  }

  private get redis() {
    return this.redisService.redis;
  }

  /**
   * Obtém anúncios ativos próximos às coordenadas do usuário
   * @param latitude Coordenada latitude do usuário
   * @param longitude Coordenada longitude do usuário
   */
  async getNearbyAnuncios(latitude: number, longitude: number): Promise<NearbyAdResult[]> {
    // 1. Calcula os 9 Geohashes regionais relevantes (central + 8 vizinhos)
    const regionalHashes = Geohash.get9Neighbors(latitude, longitude);
    const redisKeys = regionalHashes.map(hash => `anuncios:geohash:${hash}`);

    // 2. Realiza consulta rápida (MGET) no Redis para todos os hashes
    const cachedData = await this.redis.mget(...redisKeys);
    
    let cacheHit = true;
    const combinedAds: NearbyAdResult[] = [];

    for (let i = 0; i < cachedData.length; i++) {
      const data = cachedData[i];
      if (data === null) {
        // Encontrou um cache miss para este quadrante
        cacheHit = false;
        break;
      }
      const ads: NearbyAdResult[] = JSON.parse(data);
      combinedAds.push(...ads);
    }

    if (cacheHit) {
      // Ordena os anúncios em cache pela distância geográfica exata calculada em memória
      return combinedAds.sort((a, b) => a.distancia - b.distancia);
    }

    // 3. Cache Miss: Consulta o banco PostgreSQL + PostGIS com indexação espacial GiST
    const dbResults = await this.db
      .select({
        id: anuncios.id,
        titulo: anuncios.titulo,
        raioAlcanceKm: anuncios.raioAlcanceKm,
        lojaNome: lojas.nome,
        lojaLatitude: sql<number>`ST_Y(${lojas.localizacao}::geometry)`,
        lojaLongitude: sql<number>`ST_X(${lojas.localizacao}::geometry)`,
        produtoNome: produtos.nome,
        codigoBarras: produtos.codigoBarras,
        precoMedio: produtos.precoMedio,
        // Distância exata calculada pelo PostGIS (retorna em metros, dividimos por 1000 para Km)
        distancia: sql<number>`ST_Distance(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000`
      })
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(
        and(
          eq(anuncios.status, 'ativo'),
          // Verifica se a loja está dentro do raio do anúncio
          sql`ST_DWithin(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography, ${anuncios.raioAlcanceKm} * 1000)`
        )
      );

    // Mapeia os resultados para o formato final
    const formattedAds: NearbyAdResult[] = dbResults.map(ad => ({
      id: ad.id,
      titulo: ad.titulo,
      distancia: parseFloat(ad.distancia.toFixed(3)), // Precisão de metros
      lojaNome: ad.lojaNome,
      produtoNome: ad.produtoNome,
      codigoBarras: ad.codigoBarras,
      precoMedio: ad.precoMedio
    }));

    // 4. Agrupa os anúncios do banco por Geohash de suas respectivas lojas para caching
    const groupedByHash: Record<string, NearbyAdResult[]> = {};
    
    // Inicializa todos os 9 hashes regionais como vazios para evitar cache stampede
    for (const hash of regionalHashes) {
      groupedByHash[hash] = [];
    }

    for (let i = 0; i < dbResults.length; i++) {
      const dbAd = dbResults[i];
      const storeHash = Geohash.encode(dbAd.lojaLatitude, dbAd.lojaLongitude, 5);
      
      const adResult = formattedAds[i];
      
      if (!groupedByHash[storeHash]) {
        groupedByHash[storeHash] = [];
      }
      groupedByHash[storeHash].push(adResult);
    }

    // Grava cada lote de quadrante no Redis com TTL de 5 minutos (300 segundos)
    const pipeline = this.redis.pipeline();
    for (const [hash, ads] of Object.entries(groupedByHash)) {
      pipeline.set(`anuncios:geohash:${hash}`, JSON.stringify(ads), 'EX', 300);
    }
    await pipeline.exec();

    // Retorna ordenado por distância
    return formattedAds.sort((a, b) => a.distancia - b.distancia);
  }
}
