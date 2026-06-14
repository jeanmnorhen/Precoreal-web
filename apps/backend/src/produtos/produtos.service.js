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
exports.ProdutosService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@precoreal/shared");
const drizzle_orm_1 = require("drizzle-orm");
let ProdutosService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProdutosService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProdutosService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        dbService;
        constructor(dbService) {
            this.dbService = dbService;
        }
        get db() {
            return this.dbService.database;
        }
        async create(dto) {
            const existing = await this.db
                .select()
                .from(shared_1.produtos)
                .where((0, drizzle_orm_1.eq)(shared_1.produtos.codigoBarras, dto.codigoBarras))
                .limit(1);
            if (existing.length > 0) {
                throw new common_1.ConflictException('Produto com este código de barras já existe.');
            }
            const [produto] = await this.db.insert(shared_1.produtos).values(dto).returning();
            return produto;
        }
        async findAll(search) {
            if (search) {
                return this.db
                    .select()
                    .from(shared_1.produtos)
                    .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(shared_1.produtos.nome, `%${search}%`), (0, drizzle_orm_1.like)(shared_1.produtos.codigoBarras, `%${search}%`), (0, drizzle_orm_1.like)(shared_1.produtos.marca, `%${search}%`), (0, drizzle_orm_1.like)(shared_1.produtos.categoria, `%${search}%`)))
                    .limit(50);
            }
            return this.db.select().from(shared_1.produtos).limit(50);
        }
        async findByCodigoBarras(codigoBarras) {
            const [produto] = await this.db
                .select()
                .from(shared_1.produtos)
                .where((0, drizzle_orm_1.eq)(shared_1.produtos.codigoBarras, codigoBarras))
                .limit(1);
            return produto || null;
        }
        async findById(id) {
            const [produto] = await this.db
                .select()
                .from(shared_1.produtos)
                .where((0, drizzle_orm_1.eq)(shared_1.produtos.id, id))
                .limit(1);
            if (!produto)
                throw new common_1.NotFoundException('Produto não encontrado.');
            return produto;
        }
        async update(id, dto) {
            const [produto] = await this.db
                .update(shared_1.produtos)
                .set(dto)
                .where((0, drizzle_orm_1.eq)(shared_1.produtos.id, id))
                .returning();
            if (!produto)
                throw new common_1.NotFoundException('Produto não encontrado.');
            return produto;
        }
        async delete(id) {
            const [produto] = await this.db
                .delete(shared_1.produtos)
                .where((0, drizzle_orm_1.eq)(shared_1.produtos.id, id))
                .returning();
            if (!produto)
                throw new common_1.NotFoundException('Produto não encontrado.');
            return produto;
        }
    };
    return ProdutosService = _classThis;
})();
exports.ProdutosService = ProdutosService;
