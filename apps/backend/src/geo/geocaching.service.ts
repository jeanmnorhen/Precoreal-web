import { Injectable, Inject, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Geohash } from './geohash';
import { ANUNCIO_REPOSITORY } from '@precoreal/domain';
import type { IAnuncioRepository, NearbyAdResult } from '@precoreal/domain';

@Injectable()
export class GeocachingService {
  private readonly logger = new Logger(GeocachingService.name);

  constructor(
    private readonly redisService: RedisService,
    @Inject(ANUNCIO_REPOSITORY) private readonly anuncioRepo: IAnuncioRepository,
  ) {}

  private get redis() {
    return this.redisService.redis;
  }

  async getNearbyAnuncios(
    latitude: number,
    longitude: number,
    tipo?: string,
  ): Promise<NearbyAdResult[]> {
    try {
      return await this.tryGeocache(latitude, longitude, tipo);
    } catch (err) {
      this.logger.warn(
        `Falha no cache geo, usando fallback: ${(err as Error).message}`,
      );
      return this.anuncioRepo.findAtivosComDetalhes(20);
    }
  }

  private async tryGeocache(
    latitude: number,
    longitude: number,
    tipo?: string,
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

    const formattedAds = await this.anuncioRepo.findProximos(latitude, longitude, tipo);

    if (redisAvailable) {
      try {
        const groupedByHash: Record<string, NearbyAdResult[]> = {};
        for (const hash of regionalHashes) {
          groupedByHash[hash] = [];
        }

        for (const ad of formattedAds) {
          const storeHash = Geohash.encode(
            ad.lojaLatitude,
            ad.lojaLongitude,
            5,
          );
          if (!groupedByHash[storeHash]) {
            groupedByHash[storeHash] = [];
          }
          groupedByHash[storeHash].push(ad);
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
}
