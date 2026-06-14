"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const Sentry = __importStar(require("@sentry/node"));
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
async function bootstrap() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN_BACKEND,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1,
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: { colorize: true },
            },
        },
        bodyLimit: 1048576,
        genReqId: () => (0, crypto_1.randomUUID)(),
    }));
    const fastifyInstance = app.getHttpAdapter().getInstance();
    fastifyInstance.addContentTypeParser('application/json', { parseAs: 'buffer', bodyLimit: 1048576 }, function (_req, body, _done) {
        _req.rawBody = body;
        try {
            const parsed = JSON.parse(body.toString('utf8'));
            _done(null, parsed);
        }
        catch (err) {
            _done(err, body);
        }
    });
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
    Sentry.captureException(err);
    console.error(err);
    process.exit(1);
});
