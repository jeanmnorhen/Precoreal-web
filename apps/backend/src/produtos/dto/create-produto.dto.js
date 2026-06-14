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
exports.CreateProdutoDto = void 0;
const class_validator_1 = require("class-validator");
let CreateProdutoDto = (() => {
    let _codigoBarras_decorators;
    let _codigoBarras_initializers = [];
    let _codigoBarras_extraInitializers = [];
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _descricao_decorators;
    let _descricao_initializers = [];
    let _descricao_extraInitializers = [];
    let _categoria_decorators;
    let _categoria_initializers = [];
    let _categoria_extraInitializers = [];
    let _marca_decorators;
    let _marca_initializers = [];
    let _marca_extraInitializers = [];
    let _precoMedio_decorators;
    let _precoMedio_initializers = [];
    let _precoMedio_extraInitializers = [];
    let _listaImagens_decorators;
    let _listaImagens_initializers = [];
    let _listaImagens_extraInitializers = [];
    return class CreateProdutoDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _codigoBarras_decorators = [(0, class_validator_1.IsString)()];
            _nome_decorators = [(0, class_validator_1.IsString)()];
            _descricao_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _categoria_decorators = [(0, class_validator_1.IsString)()];
            _marca_decorators = [(0, class_validator_1.IsString)()];
            _precoMedio_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _listaImagens_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _codigoBarras_decorators, { kind: "field", name: "codigoBarras", static: false, private: false, access: { has: obj => "codigoBarras" in obj, get: obj => obj.codigoBarras, set: (obj, value) => { obj.codigoBarras = value; } }, metadata: _metadata }, _codigoBarras_initializers, _codigoBarras_extraInitializers);
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _descricao_decorators, { kind: "field", name: "descricao", static: false, private: false, access: { has: obj => "descricao" in obj, get: obj => obj.descricao, set: (obj, value) => { obj.descricao = value; } }, metadata: _metadata }, _descricao_initializers, _descricao_extraInitializers);
            __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: obj => "categoria" in obj, get: obj => obj.categoria, set: (obj, value) => { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
            __esDecorate(null, null, _marca_decorators, { kind: "field", name: "marca", static: false, private: false, access: { has: obj => "marca" in obj, get: obj => obj.marca, set: (obj, value) => { obj.marca = value; } }, metadata: _metadata }, _marca_initializers, _marca_extraInitializers);
            __esDecorate(null, null, _precoMedio_decorators, { kind: "field", name: "precoMedio", static: false, private: false, access: { has: obj => "precoMedio" in obj, get: obj => obj.precoMedio, set: (obj, value) => { obj.precoMedio = value; } }, metadata: _metadata }, _precoMedio_initializers, _precoMedio_extraInitializers);
            __esDecorate(null, null, _listaImagens_decorators, { kind: "field", name: "listaImagens", static: false, private: false, access: { has: obj => "listaImagens" in obj, get: obj => obj.listaImagens, set: (obj, value) => { obj.listaImagens = value; } }, metadata: _metadata }, _listaImagens_initializers, _listaImagens_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        codigoBarras = __runInitializers(this, _codigoBarras_initializers, void 0);
        nome = (__runInitializers(this, _codigoBarras_extraInitializers), __runInitializers(this, _nome_initializers, void 0));
        descricao = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _descricao_initializers, void 0));
        categoria = (__runInitializers(this, _descricao_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
        marca = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _marca_initializers, void 0));
        precoMedio = (__runInitializers(this, _marca_extraInitializers), __runInitializers(this, _precoMedio_initializers, void 0));
        listaImagens = (__runInitializers(this, _precoMedio_extraInitializers), __runInitializers(this, _listaImagens_initializers, void 0));
        constructor() {
            __runInitializers(this, _listaImagens_extraInitializers);
        }
    };
})();
exports.CreateProdutoDto = CreateProdutoDto;
