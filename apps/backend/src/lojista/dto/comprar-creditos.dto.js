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
exports.ComprarCreditosDto = void 0;
const class_validator_1 = require("class-validator");
let ComprarCreditosDto = (() => {
    let _valorCentavos_decorators;
    let _valorCentavos_initializers = [];
    let _valorCentavos_extraInitializers = [];
    let _lojaId_decorators;
    let _lojaId_initializers = [];
    let _lojaId_extraInitializers = [];
    return class ComprarCreditosDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _valorCentavos_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(100)];
            _lojaId_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _valorCentavos_decorators, { kind: "field", name: "valorCentavos", static: false, private: false, access: { has: obj => "valorCentavos" in obj, get: obj => obj.valorCentavos, set: (obj, value) => { obj.valorCentavos = value; } }, metadata: _metadata }, _valorCentavos_initializers, _valorCentavos_extraInitializers);
            __esDecorate(null, null, _lojaId_decorators, { kind: "field", name: "lojaId", static: false, private: false, access: { has: obj => "lojaId" in obj, get: obj => obj.lojaId, set: (obj, value) => { obj.lojaId = value; } }, metadata: _metadata }, _lojaId_initializers, _lojaId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        valorCentavos = __runInitializers(this, _valorCentavos_initializers, void 0);
        lojaId = (__runInitializers(this, _valorCentavos_extraInitializers), __runInitializers(this, _lojaId_initializers, void 0));
        constructor() {
            __runInitializers(this, _lojaId_extraInitializers);
        }
    };
})();
exports.ComprarCreditosDto = ComprarCreditosDto;
