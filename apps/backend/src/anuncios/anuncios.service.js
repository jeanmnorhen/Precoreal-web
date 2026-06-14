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
exports.AnunciosService = void 0;
const common_1 = require("@nestjs/common");
let AnunciosService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnunciosService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AnunciosService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        anuncioRepo;
        constructor(anuncioRepo) {
            this.anuncioRepo = anuncioRepo;
        }
        async create(dto) {
            return this.anuncioRepo.create({
                produtoId: dto.produtoId,
                titulo: dto.titulo,
                descricao: dto.descricao,
                raioAlcanceKm: dto.raioAlcanceKm,
                custoCreditos: dto.custoCreditos,
                dataInicio: new Date(dto.dataInicio),
                dataFim: new Date(dto.dataFim),
            });
        }
        async findAll() {
            return this.anuncioRepo.findAll();
        }
        async findById(id) {
            const anuncio = await this.anuncioRepo.findById(id);
            if (!anuncio)
                throw new common_1.NotFoundException('Anúncio não encontrado.');
            return anuncio;
        }
        async update(id, dto) {
            const anuncio = await this.anuncioRepo.update(id, {
                ...(dto.produtoId && { produtoId: dto.produtoId }),
                ...(dto.titulo && { titulo: dto.titulo }),
                ...(dto.descricao && { descricao: dto.descricao }),
                ...(dto.raioAlcanceKm && { raioAlcanceKm: dto.raioAlcanceKm }),
                ...(dto.custoCreditos && { custoCreditos: dto.custoCreditos }),
                ...(dto.dataInicio && { dataInicio: new Date(dto.dataInicio) }),
                ...(dto.dataFim && { dataFim: new Date(dto.dataFim) }),
                ...(dto.status && { status: dto.status }),
            });
            if (!anuncio)
                throw new common_1.NotFoundException('Anúncio não encontrado.');
            return anuncio;
        }
        async delete(id) {
            const anuncio = await this.anuncioRepo.delete(id);
            if (!anuncio)
                throw new common_1.NotFoundException('Anúncio não encontrado.');
            return anuncio;
        }
    };
    return AnunciosService = _classThis;
})();
exports.AnunciosService = AnunciosService;
