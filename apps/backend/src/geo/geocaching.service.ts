import { Injectable, Logger } from '@nestjs/common';
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
  lojaLatitude: number;
  lojaLongitude: number;
  produtoNome: string;
  codigoBarras: string;
  precoMedio: number;
}

@Injectable()
export class GeocachingService {
  private readonly logger = new Logger(GeocachingService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  private get db() {
    return this.dbService.database;
  }

  private get redis() {
    return this.redisService.redis;
  }

  async getNearbyAnuncios(
    latitude: number,
    longitude: number,
  ): Promise<NearbyAdResult[]> {
    try {
      return await this.tryGeocache(latitude, longitude);
    } catch (err) {
      this.logger.warn(
        `Falha no cache geo, usando fallback: ${(err as Error).message}`,
      );
      return this.fallbackAnuncios();
    }
  }

  private async tryGeocache(
    latitude: number,
    longitude: number,
  ): Promise<NearbyAdResult[]> {
    const regionalHashes = Geohash.get9Neighbors(latitude, longitude);
    const redisKeys = regionalHashes.map((hash) => `anuncios:geohash:${hash}`);

    let redisAvailable = true;
    let cachedData: (string | null)[];

    try {
      cachedData = await this.redis.mget(...redisKeys);
    } catch {
      redisAvailable = false;
      cachedData = regionalHashes.map(() => null);
    }

    let cacheHit = true;
    const combinedAds: NearbyAdResult[] = [];

    if (redisAvailable) {
      for (let i = 0; i < cachedData.length; i++) {
        const data = cachedData[i];
        if (data === null) {
          cacheHit = false;
          break;
        }
        const ads: NearbyAdResult[] = JSON.parse(data);
        combinedAds.push(...ads);
      }

      if (cacheHit) {
        return combinedAds.sort((a, b) => a.distancia - b.distancia);
      }
    }

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
        distancia: sql<number>`ST_Distance(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000`,
      })
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(
        and(
          eq(anuncios.status, 'ativo'),
          sql`ST_DWithin(${lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography, ${anuncios.raioAlcanceKm} * 1000)`,
        ),
      );

    const formattedAds: NearbyAdResult[] = dbResults.map((ad) => ({
      id: ad.id,
      titulo: ad.titulo,
      distancia: parseFloat(ad.distancia.toFixed(3)),
      lojaNome: ad.lojaNome,
      lojaLatitude: ad.lojaLatitude,
      lojaLongitude: ad.lojaLongitude,
      produtoNome: ad.produtoNome,
      codigoBarras: ad.codigoBarras,
      precoMedio: ad.precoMedio,
    }));

    if (redisAvailable) {
      try {
        const groupedByHash: Record<string, NearbyAdResult[]> = {};
        for (const hash of regionalHashes) {
          groupedByHash[hash] = [];
        }

        for (let i = 0; i < dbResults.length; i++) {
          const dbAd = dbResults[i];
          const storeHash = Geohash.encode(
            dbAd.lojaLatitude,
            dbAd.lojaLongitude,
            5,
          );
          const adResult = formattedAds[i];
          if (!groupedByHash[storeHash]) {
            groupedByHash[storeHash] = [];
          }
          groupedByHash[storeHash].push(adResult);
        }

        const pipeline = this.redis.pipeline();
        for (const [hash, ads] of Object.entries(groupedByHash)) {
          pipeline.set(
            `anuncios:geohash:${hash}`,
            JSON.stringify(ads),
            'EX',
            300,
          );
        }
        await pipeline.exec();
      } catch (err) {
        this.logger.warn(
          `Falha ao salvar cache geo: ${(err as Error).message}`,
        );
      }
    }

    return formattedAds.sort((a, b) => a.distancia - b.distancia);
  }

  private async fallbackAnuncios(): Promise<NearbyAdResult[]> {
    const results = await this.db
      .select({
        id: anuncios.id,
        titulo: anuncios.titulo,
        lojaNome: lojas.nome,
        lojaLatitude: sql<number>`ST_Y(${lojas.localizacao}::geometry)`,
        lojaLongitude: sql<number>`ST_X(${lojas.localizacao}::geometry)`,
        produtoNome: produtos.nome,
        codigoBarras: produtos.codigoBarras,
        precoMedio: produtos.precoMedio,
      })
      .from(anuncios)
      .innerJoin(lojas, eq(anuncios.lojaId, lojas.id))
      .innerJoin(produtos, eq(anuncios.produtoId, produtos.id))
      .where(eq(anuncios.status, 'ativo'))
      .limit(20);

    return results.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      distancia: 999,
      lojaNome: r.lojaNome,
      lojaLatitude: r.lojaLatitude,
      lojaLongitude: r.lojaLongitude,
      produtoNome: r.produtoNome,
      codigoBarras: r.codigoBarras,
      precoMedio: r.precoMedio,
    }));
  }
}
