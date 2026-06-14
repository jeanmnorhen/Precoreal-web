'use client';
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
exports.BarcodeScanner = void 0;
const react_1 = __importStar(require("react"));
const react_zxing_1 = require("react-zxing");
const shared_1 = require("@precoreal/shared");
const BarcodeScanner = ({ onScanSuccess, className = '', }) => {
    const [lastCode, setLastCode] = (0, react_1.useState)(null);
    const [paused, setPaused] = (0, react_1.useState)(false);
    const handleResult = (0, react_1.useCallback)((rawText) => {
        if (paused || rawText === lastCode)
            return;
        const parsed = shared_1.GS1ApplicationParser.parse(rawText);
        setLastCode(rawText);
        setPaused(true);
        // Chama callback com resultado e aguarda 2s antes de reativar o scanner
        onScanSuccess(parsed);
        setTimeout(() => {
            setPaused(false);
            setLastCode(null);
        }, 2000);
    }, [paused, lastCode, onScanSuccess]);
    const { ref } = (0, react_zxing_1.useZxing)({
        paused,
        onDecodeResult(result) {
            handleResult(result.getText());
        },
        onDecodeError(error) {
            console.debug('[BarcodeScanner] Frame error:', error);
        },
    });
    return (<div className={`relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl ${className}`} style={{ aspectRatio: '4/3' }}>
      {/* Stream de vídeo da câmera */}
      <video ref={ref} className="w-full h-full object-cover" playsInline muted/>

      {/* Overlay com viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Cantos de foco animados */}
        <div className="relative w-56 h-36">
          {/* Topo-esquerdo */}
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-md animate-pulse-ring" style={{ borderColor: 'var(--color-primary)' }}/>
          {/* Topo-direito */}
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-md" style={{ borderColor: 'var(--color-primary)' }}/>
          {/* Base-esquerdo */}
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-md" style={{ borderColor: 'var(--color-primary)' }}/>
          {/* Base-direito */}
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-md" style={{ borderColor: 'var(--color-primary)' }}/>

          {/* Linha de varredura animada */}
          <div className="absolute left-0 right-0 h-0.5 animate-bounce" style={{ top: '50%', background: 'var(--color-primary)', opacity: 0.8 }}/>
        </div>
      </div>

      {/* Status de pausa após leitura */}
      {paused && (<div className="absolute inset-0 flex items-center justify-center animate-fade-in-up" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="glass-card px-6 py-4 text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              ✓ Código Lido!
            </p>
            <p className="text-sm mt-1 opacity-75" style={{ color: 'var(--color-foreground)' }}>
              Buscando produto...
            </p>
          </div>
        </div>)}
    </div>);
};
exports.BarcodeScanner = BarcodeScanner;
