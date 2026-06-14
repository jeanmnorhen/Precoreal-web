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
exports.ScanResultDto = void 0;
const class_validator_1 = require("class-validator");
let ScanResultDto = (() => {
    let _codigoBarras_decorators;
    let _codigoBarras_initializers = [];
    let _codigoBarras_extraInitializers = [];
    let _latitude_decorators;
    let _latitude_initializers = [];
    let _latitude_extraInitializers = [];
    let _longitude_decorators;
    let _longitude_initializers = [];
    let _longitude_extraInitializers = [];
    return class ScanResultDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _codigoBarras_decorators = [(0, class_validator_1.IsString)()];
            _latitude_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _longitude_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _codigoBarras_decorators, { kind: "field", name: "codigoBarras", static: false, private: false, access: { has: obj => "codigoBarras" in obj, get: obj => obj.codigoBarras, set: (obj, value) => { obj.codigoBarras = value; } }, metadata: _metadata }, _codigoBarras_initializers, _codigoBarras_extraInitializers);
            __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: obj => "latitude" in obj, get: obj => obj.latitude, set: (obj, value) => { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
            __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: obj => "longitude" in obj, get: obj => obj.longitude, set: (obj, value) => { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        codigoBarras = __runInitializers(this, _codigoBarras_initializers, void 0);
        latitude = (__runInitializers(this, _codigoBarras_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
        longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
        constructor() {
            __runInitializers(this, _longitude_extraInitializers);
        }
    };
})();
exports.ScanResultDto = ScanResultDto;
