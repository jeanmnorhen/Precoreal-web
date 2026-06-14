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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@precoreal/shared");
const drizzle_orm_1 = require("drizzle-orm");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StripeService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StripeService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        dbService;
        stripe;
        circuitOpen = false;
        consecutiveFailures = 0;
        lastFailureTime = 0;
        constructor(dbService) {
            this.dbService = dbService;
        }
        get db() {
            return this.dbService.database;
        }
        onModuleInit() {
            const key = process.env.STRIPE_RESTRICTED_KEY;
            if (!key) {
                throw new Error('A variável de ambiente STRIPE_RESTRICTED_KEY não está configurada.');
            }
            this.stripe = new stripe_1.default(key, {
                apiVersion: '2024-04-10',
            });
        }
        async withCircuitBreaker(fn) {
            // Circuit breaker: 3 falhas consecutivas em 20s abre o circuito
            if (this.circuitOpen) {
                const elapsed = Date.now() - this.lastFailureTime;
                if (elapsed > 20000) {
                    this.circuitOpen = false;
                    this.consecutiveFailures = 0;
                }
                else {
                    throw new Error('Serviço de pagamento temporariamente indisponível. Tente novamente em alguns instantes.');
                }
            }
            try {
                const result = await fn();
                this.consecutiveFailures = 0;
                return result;
            }
            catch (err) {
                this.consecutiveFailures++;
                this.lastFailureTime = Date.now();
                if (this.consecutiveFailures >= 3) {
                    this.circuitOpen = true;
                }
                throw err;
            }
        }
        async createPaymentIntent(valorCentavos, email, usuarioId) {
            return this.withCircuitBreaker(async () => {
                const paymentIntent = await this.stripe.paymentIntents.create({
                    amount: valorCentavos,
                    currency: 'brl',
                    metadata: {
                        usuarioId,
                        creditosAAdicionar: valorCentavos.toString(),
                    },
                    receipt_email: email,
                });
                return {
                    clientSecret: paymentIntent.client_secret,
                    id: paymentIntent.id,
                };
            });
        }
        async handleWebhook(signature, rawBody) {
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                throw new Error('STRIPE_WEBHOOK_SECRET não configurado.');
            }
            let event;
            try {
                event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
            }
            catch (err) {
                throw new Error(`Assinatura do webhook inválida: ${err.message}`);
            }
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                await this.processarPagamentoBemSucedido(paymentIntent);
            }
            return { received: true };
        }
        async processarPagamentoBemSucedido(paymentIntent) {
            const usuarioId = paymentIntent.metadata.usuarioId;
            const creditos = parseInt(paymentIntent.metadata.creditosAAdicionar || '0', 10);
            if (!usuarioId || creditos <= 0)
                return;
            await this.db
                .update(shared_1.usuarios)
                .set({
                saldoCreditos: (0, drizzle_orm_1.sql) `${shared_1.usuarios.saldoCreditos} + ${creditos}`,
            })
                .where((0, drizzle_orm_1.eq)(shared_1.usuarios.id, usuarioId));
        }
    };
    return StripeService = _classThis;
})();
exports.StripeService = StripeService;
