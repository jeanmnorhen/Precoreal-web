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
exports.UpdateAnuncioDto = void 0;
const class_validator_1 = require("class-validator");
let UpdateAnuncioDto = (() => {
    let _produtoId_decorators;
    let _produtoId_initializers = [];
    let _produtoId_extraInitializers = [];
    let _titulo_decorators;
    let _titulo_initializers = [];
    let _titulo_extraInitializers = [];
    let _descricao_decorators;
    let _descricao_initializers = [];
    let _descricao_extraInitializers = [];
    let _raioAlcanceKm_decorators;
    let _raioAlcanceKm_initializers = [];
    let _raioAlcanceKm_extraInitializers = [];
    let _custoCreditos_decorators;
    let _custoCreditos_initializers = [];
    let _custoCreditos_extraInitializers = [];
    let _dataInicio_decorators;
    let _dataInicio_initializers = [];
    let _dataInicio_extraInitializers = [];
    let _dataFim_decorators;
    let _dataFim_initializers = [];
    let _dataFim_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    return class UpdateAnuncioDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _produtoId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _titulo_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _descricao_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _raioAlcanceKm_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _custoCreditos_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _dataInicio_decorators = [(0, class_validator_1.IsDateString)(), (0, class_validator_1.IsOptional)()];
            _dataFim_decorators = [(0, class_validator_1.IsDateString)(), (0, class_validator_1.IsOptional)()];
            _status_decorators = [(0, class_validator_1.IsEnum)(['ativo', 'pausado', 'expirado']), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _produtoId_decorators, { kind: "field", name: "produtoId", static: false, private: false, access: { has: obj => "produtoId" in obj, get: obj => obj.produtoId, set: (obj, value) => { obj.produtoId = value; } }, metadata: _metadata }, _produtoId_initializers, _produtoId_extraInitializers);
            __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: obj => "titulo" in obj, get: obj => obj.titulo, set: (obj, value) => { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
            __esDecorate(null, null, _descricao_decorators, { kind: "field", name: "descricao", static: false, private: false, access: { has: obj => "descricao" in obj, get: obj => obj.descricao, set: (obj, value) => { obj.descricao = value; } }, metadata: _metadata }, _descricao_initializers, _descricao_extraInitializers);
            __esDecorate(null, null, _raioAlcanceKm_decorators, { kind: "field", name: "raioAlcanceKm", static: false, private: false, access: { has: obj => "raioAlcanceKm" in obj, get: obj => obj.raioAlcanceKm, set: (obj, value) => { obj.raioAlcanceKm = value; } }, metadata: _metadata }, _raioAlcanceKm_initializers, _raioAlcanceKm_extraInitializers);
            __esDecorate(null, null, _custoCreditos_decorators, { kind: "field", name: "custoCreditos", static: false, private: false, access: { has: obj => "custoCreditos" in obj, get: obj => obj.custoCreditos, set: (obj, value) => { obj.custoCreditos = value; } }, metadata: _metadata }, _custoCreditos_initializers, _custoCreditos_extraInitializers);
            __esDecorate(null, null, _dataInicio_decorators, { kind: "field", name: "dataInicio", static: false, private: false, access: { has: obj => "dataInicio" in obj, get: obj => obj.dataInicio, set: (obj, value) => { obj.dataInicio = value; } }, metadata: _metadata }, _dataInicio_initializers, _dataInicio_extraInitializers);
            __esDecorate(null, null, _dataFim_decorators, { kind: "field", name: "dataFim", static: false, private: false, access: { has: obj => "dataFim" in obj, get: obj => obj.dataFim, set: (obj, value) => { obj.dataFim = value; } }, metadata: _metadata }, _dataFim_initializers, _dataFim_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        produtoId = __runInitializers(this, _produtoId_initializers, void 0);
        titulo = (__runInitializers(this, _produtoId_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
        descricao = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _descricao_initializers, void 0));
        raioAlcanceKm = (__runInitializers(this, _descricao_extraInitializers), __runInitializers(this, _raioAlcanceKm_initializers, void 0));
        custoCreditos = (__runInitializers(this, _raioAlcanceKm_extraInitializers), __runInitializers(this, _custoCreditos_initializers, void 0));
        dataInicio = (__runInitializers(this, _custoCreditos_extraInitializers), __runInitializers(this, _dataInicio_initializers, void 0));
        dataFim = (__runInitializers(this, _dataInicio_extraInitializers), __runInitializers(this, _dataFim_initializers, void 0));
        status = (__runInitializers(this, _dataFim_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        constructor() {
            __runInitializers(this, _status_extraInitializers);
        }
    };
})();
exports.UpdateAnuncioDto = UpdateAnuncioDto;
