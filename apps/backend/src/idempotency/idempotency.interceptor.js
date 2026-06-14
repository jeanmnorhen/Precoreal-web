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
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let IdempotencyInterceptor = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IdempotencyInterceptor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IdempotencyInterceptor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        redisService;
        constructor(redisService) {
            this.redisService = redisService;
        }
        async intercept(context, next) {
            const httpContext = context.switchToHttp();
            const request = httpContext.getRequest();
            const response = httpContext.getResponse();
            // Aplica idempotência apenas em métodos de escrita mutáveis
            const method = request.method;
            if (!['POST', 'PUT', 'PATCH'].includes(method)) {
                return next.handle();
            }
            const key = request.headers['x-idempotency-key'];
            if (!key) {
                return next.handle();
            }
            const redisKey = `idempotency:${key}`;
            const redis = this.redisService.redis;
            // Consulta o status atual da chave no cache
            const cached = await redis.get(redisKey);
            if (cached) {
                const { status, body } = JSON.parse(cached);
                if (status === 'PENDING') {
                    throw new common_1.ConflictException('Requisição em processamento. Aguarde antes de retransmitir.');
                }
                else if (status === 'SUCCESS') {
                    // Envia imediatamente a resposta em cache
                    response.status(body.statusCode || 200);
                    return (0, rxjs_1.of)(body.data);
                }
            }
            // Cria bloqueio atômico com NX (Set if Not Exists) com expiração de 5 minutos
            const lockSet = await redis.set(redisKey, JSON.stringify({ status: 'PENDING' }), 'EX', 300, 'NX');
            if (!lockSet) {
                throw new common_1.ConflictException('Requisição duplicada concorrente. Bloqueio atômico ativado.');
            }
            return next.handle().pipe((0, operators_1.map)((data) => {
                // Grava o sucesso por 24 horas no Redis
                const responseBody = {
                    status: 'SUCCESS',
                    body: {
                        statusCode: response.statusCode || 200,
                        data,
                    },
                };
                redis.set(redisKey, JSON.stringify(responseBody), 'EX', 86400);
                return data;
            }), (0, operators_1.catchError)((err) => {
                // Se a transação der erro, desfaz o bloqueio atômico para permitir nova tentativa
                redis.del(redisKey);
                return (0, rxjs_1.throwError)(() => err);
            }));
        }
    };
    return IdempotencyInterceptor = _classThis;
})();
exports.IdempotencyInterceptor = IdempotencyInterceptor;
