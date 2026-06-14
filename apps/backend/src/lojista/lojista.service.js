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
exports.LojistaService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@precoreal/shared");
const drizzle_orm_1 = require("drizzle-orm");
let LojistaService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var LojistaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LojistaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        dbService;
        stripeService;
        constructor(dbService, stripeService) {
            this.dbService = dbService;
            this.stripeService = stripeService;
        }
        get db() {
            return this.dbService.database;
        }
        async dashboard(usuarioId) {
            const lojasDoUsuario = await this.db
                .select({ id: shared_1.lojas.id })
                .from(shared_1.lojas)
                .where((0, drizzle_orm_1.eq)(shared_1.lojas.usuarioProprietarioId, usuarioId));
            const lojaIds = lojasDoUsuario.map((l) => l.id);
            if (lojaIds.length === 0) {
                return {
                    totalLojas: 0,
                    totalAnunciosAtivos: 0,
                    totalAnuncios: 0,
                    totalProdutos: 0,
                };
            }
            const [anuncioStats] = await this.db
                .select({
                total: (0, drizzle_orm_1.sql) `count(*)`.as(),
                ativos: (0, drizzle_orm_1.sql) `count(*) filter (where ${shared_1.anuncios.status} = 'ativo')`,
            })
                .from(shared_1.anuncios)
                .where((0, drizzle_orm_1.sql) `${shared_1.anuncios.lojaId} = any(${lojaIds}::uuid[])`);
            return {
                totalLojas: lojaIds.length,
                totalAnuncios: Number(anuncioStats?.total || 0),
                totalAnunciosAtivos: Number(anuncioStats?.ativos || 0),
            };
        }
        async comprarCreditos(usuarioId, email, valorCentavos) {
            return this.stripeService.createPaymentIntent(valorCentavos, email, usuarioId);
        }
    };
    return LojistaService = _classThis;
})();
exports.LojistaService = LojistaService;
