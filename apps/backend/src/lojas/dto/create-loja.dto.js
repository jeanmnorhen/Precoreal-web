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
exports.CreateLojaDto = void 0;
const class_validator_1 = require("class-validator");
let CreateLojaDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _descricao_decorators;
    let _descricao_initializers = [];
    let _descricao_extraInitializers = [];
    let _enderecoRua_decorators;
    let _enderecoRua_initializers = [];
    let _enderecoRua_extraInitializers = [];
    let _enderecoNumero_decorators;
    let _enderecoNumero_initializers = [];
    let _enderecoNumero_extraInitializers = [];
    let _enderecoBairro_decorators;
    let _enderecoBairro_initializers = [];
    let _enderecoBairro_extraInitializers = [];
    let _enderecoCidade_decorators;
    let _enderecoCidade_initializers = [];
    let _enderecoCidade_extraInitializers = [];
    let _enderecoEstado_decorators;
    let _enderecoEstado_initializers = [];
    let _enderecoEstado_extraInitializers = [];
    let _enderecoCep_decorators;
    let _enderecoCep_initializers = [];
    let _enderecoCep_extraInitializers = [];
    let _latitude_decorators;
    let _latitude_initializers = [];
    let _latitude_extraInitializers = [];
    let _longitude_decorators;
    let _longitude_initializers = [];
    let _longitude_extraInitializers = [];
    return class CreateLojaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _descricao_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _enderecoRua_decorators = [(0, class_validator_1.IsString)()];
            _enderecoNumero_decorators = [(0, class_validator_1.IsString)()];
            _enderecoBairro_decorators = [(0, class_validator_1.IsString)()];
            _enderecoCidade_decorators = [(0, class_validator_1.IsString)()];
            _enderecoEstado_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(2)];
            _enderecoCep_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(8), (0, class_validator_1.MaxLength)(8)];
            _latitude_decorators = [(0, class_validator_1.IsString)()];
            _longitude_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _descricao_decorators, { kind: "field", name: "descricao", static: false, private: false, access: { has: obj => "descricao" in obj, get: obj => obj.descricao, set: (obj, value) => { obj.descricao = value; } }, metadata: _metadata }, _descricao_initializers, _descricao_extraInitializers);
            __esDecorate(null, null, _enderecoRua_decorators, { kind: "field", name: "enderecoRua", static: false, private: false, access: { has: obj => "enderecoRua" in obj, get: obj => obj.enderecoRua, set: (obj, value) => { obj.enderecoRua = value; } }, metadata: _metadata }, _enderecoRua_initializers, _enderecoRua_extraInitializers);
            __esDecorate(null, null, _enderecoNumero_decorators, { kind: "field", name: "enderecoNumero", static: false, private: false, access: { has: obj => "enderecoNumero" in obj, get: obj => obj.enderecoNumero, set: (obj, value) => { obj.enderecoNumero = value; } }, metadata: _metadata }, _enderecoNumero_initializers, _enderecoNumero_extraInitializers);
            __esDecorate(null, null, _enderecoBairro_decorators, { kind: "field", name: "enderecoBairro", static: false, private: false, access: { has: obj => "enderecoBairro" in obj, get: obj => obj.enderecoBairro, set: (obj, value) => { obj.enderecoBairro = value; } }, metadata: _metadata }, _enderecoBairro_initializers, _enderecoBairro_extraInitializers);
            __esDecorate(null, null, _enderecoCidade_decorators, { kind: "field", name: "enderecoCidade", static: false, private: false, access: { has: obj => "enderecoCidade" in obj, get: obj => obj.enderecoCidade, set: (obj, value) => { obj.enderecoCidade = value; } }, metadata: _metadata }, _enderecoCidade_initializers, _enderecoCidade_extraInitializers);
            __esDecorate(null, null, _enderecoEstado_decorators, { kind: "field", name: "enderecoEstado", static: false, private: false, access: { has: obj => "enderecoEstado" in obj, get: obj => obj.enderecoEstado, set: (obj, value) => { obj.enderecoEstado = value; } }, metadata: _metadata }, _enderecoEstado_initializers, _enderecoEstado_extraInitializers);
            __esDecorate(null, null, _enderecoCep_decorators, { kind: "field", name: "enderecoCep", static: false, private: false, access: { has: obj => "enderecoCep" in obj, get: obj => obj.enderecoCep, set: (obj, value) => { obj.enderecoCep = value; } }, metadata: _metadata }, _enderecoCep_initializers, _enderecoCep_extraInitializers);
            __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: obj => "latitude" in obj, get: obj => obj.latitude, set: (obj, value) => { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
            __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: obj => "longitude" in obj, get: obj => obj.longitude, set: (obj, value) => { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        descricao = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _descricao_initializers, void 0));
        enderecoRua = (__runInitializers(this, _descricao_extraInitializers), __runInitializers(this, _enderecoRua_initializers, void 0));
        enderecoNumero = (__runInitializers(this, _enderecoRua_extraInitializers), __runInitializers(this, _enderecoNumero_initializers, void 0));
        enderecoBairro = (__runInitializers(this, _enderecoNumero_extraInitializers), __runInitializers(this, _enderecoBairro_initializers, void 0));
        enderecoCidade = (__runInitializers(this, _enderecoBairro_extraInitializers), __runInitializers(this, _enderecoCidade_initializers, void 0));
        enderecoEstado = (__runInitializers(this, _enderecoCidade_extraInitializers), __runInitializers(this, _enderecoEstado_initializers, void 0));
        enderecoCep = (__runInitializers(this, _enderecoEstado_extraInitializers), __runInitializers(this, _enderecoCep_initializers, void 0));
        latitude = (__runInitializers(this, _enderecoCep_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
        longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
        constructor() {
            __runInitializers(this, _longitude_extraInitializers);
        }
    };
})();
exports.CreateLojaDto = CreateLojaDto;
