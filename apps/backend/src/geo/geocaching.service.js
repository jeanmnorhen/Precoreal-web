"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocachingService = void 0;
const common_1 = require("@nestjs/common");
const geohash_1 = require("./geohash");
const shared_1 = require("@precoreal/shared");
const drizzle_orm_1 = require("drizzle-orm");
let GeocachingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GeocachingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GeocachingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        dbService;
        redisService;
        logger = new common_1.Logger(GeocachingService.name);
        constructor(dbService, redisService) {
            this.dbService = dbService;
            this.redisService = redisService;
        }
        get db() {
            return this.dbService.database;
        }
        get redis() {
            return this.redisService.redis;
        }
        async getNearbyAnuncios(latitude, longitude) {
            try {
                return await this.tryGeocache(latitude, longitude);
            }
            catch (err) {
                this.logger.warn(`Falha no cache geo, usando fallback: ${err.message}`);
                return this.fallbackAnuncios();
            }
        }
        async tryGeocache(latitude, longitude) {
            const regionalHashes = geohash_1.Geohash.get9Neighbors(latitude, longitude);
            const redisKeys = regionalHashes.map((hash) => `anuncios:geohash:${hash}`);
            let redisAvailable = true;
            let cachedData;
            try {
                cachedData = await this.redis.mget(...redisKeys);
            }
            catch {
                redisAvailable = false;
                cachedData = regionalHashes.map(() => null);
            }
            let cacheHit = true;
            const combinedAds = [];
            if (redisAvailable) {
                for (let i = 0; i < cachedData.length; i++) {
                    const data = cachedData[i];
                    if (data === null) {
                        cacheHit = false;
                        break;
                    }
                    const ads = JSON.parse(data);
                    combinedAds.push(...ads);
                }
                if (cacheHit) {
                    return combinedAds.sort((a, b) => a.distancia - b.distancia);
                }
            }
            const dbResults = await this.db
                .select({
                id: shared_1.anuncios.id,
                titulo: shared_1.anuncios.titulo,
                raioAlcanceKm: shared_1.anuncios.raioAlcanceKm,
                lojaNome: shared_1.lojas.nome,
                lojaLatitude: (0, drizzle_orm_1.sql) `ST_Y(${shared_1.lojas.localizacao}::geometry)`,
                lojaLongitude: (0, drizzle_orm_1.sql) `ST_X(${shared_1.lojas.localizacao}::geometry)`,
                produtoNome: shared_1.produtos.nome,
                codigoBarras: shared_1.produtos.codigoBarras,
                precoMedio: shared_1.produtos.precoMedio,
                distancia: (0, drizzle_orm_1.sql) `ST_Distance(${shared_1.lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000`,
            })
                .from(shared_1.anuncios)
                .innerJoin(shared_1.lojas, (0, drizzle_orm_1.eq)(shared_1.anuncios.lojaId, shared_1.lojas.id))
                .innerJoin(shared_1.produtos, (0, drizzle_orm_1.eq)(shared_1.anuncios.produtoId, shared_1.produtos.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(shared_1.anuncios.status, 'ativo'), (0, drizzle_orm_1.sql) `ST_DWithin(${shared_1.lojas.localizacao}, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography, ${shared_1.anuncios.raioAlcanceKm} * 1000)`));
            const formattedAds = dbResults.map((ad) => ({
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
                    const groupedByHash = {};
                    for (const hash of regionalHashes) {
                        groupedByHash[hash] = [];
                    }
                    for (let i = 0; i < dbResults.length; i++) {
                        const dbAd = dbResults[i];
                        const storeHash = geohash_1.Geohash.encode(dbAd.lojaLatitude, dbAd.lojaLongitude, 5);
                        const adResult = formattedAds[i];
                        if (!groupedByHash[storeHash]) {
                            groupedByHash[storeHash] = [];
                        }
                        groupedByHash[storeHash].push(adResult);
                    }
                    const pipeline = this.redis.pipeline();
                    for (const [hash, ads] of Object.entries(groupedByHash)) {
                        pipeline.set(`anuncios:geohash:${hash}`, JSON.stringify(ads), 'EX', 300);
                    }
                    await pipeline.exec();
                }
                catch (err) {
                    this.logger.warn(`Falha ao salvar cache geo: ${err.message}`);
                }
            }
            return formattedAds.sort((a, b) => a.distancia - b.distancia);
        }
        async fallbackAnuncios() {
            const results = await this.db
                .select({
                id: shared_1.anuncios.id,
                titulo: shared_1.anuncios.titulo,
                lojaNome: shared_1.lojas.nome,
                lojaLatitude: (0, drizzle_orm_1.sql) `ST_Y(${shared_1.lojas.localizacao}::geometry)`,
                lojaLongitude: (0, drizzle_orm_1.sql) `ST_X(${shared_1.lojas.localizacao}::geometry)`,
                produtoNome: shared_1.produtos.nome,
                codigoBarras: shared_1.produtos.codigoBarras,
                precoMedio: shared_1.produtos.precoMedio,
            })
                .from(shared_1.anuncios)
                .innerJoin(shared_1.lojas, (0, drizzle_orm_1.eq)(shared_1.anuncios.lojaId, shared_1.lojas.id))
                .innerJoin(shared_1.produtos, (0, drizzle_orm_1.eq)(shared_1.anuncios.produtoId, shared_1.produtos.id))
                .where((0, drizzle_orm_1.eq)(shared_1.anuncios.status, 'ativo'))
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
    };
    return GeocachingService = _classThis;
})();
exports.GeocachingService = GeocachingService;
