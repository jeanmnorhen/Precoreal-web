'use client';

import React, { useState, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { GS1ApplicationParser, ProdutoScanResultado } from '@precoreal/shared';

interface BarcodeScannerProps {
  onScanSuccess: (result: ProdutoScanResultado) => void;
  className?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  className = '',
}) => {
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleResult = useCallback(
    (rawText: string) => {
      if (paused || rawText === lastCode) return;

      const parsed = GS1ApplicationParser.parse(rawText);
      setLastCode(rawText);
      setPaused(true);

      // Chama callback com resultado e aguarda 2s antes de reativar o scanner
      onScanSuccess(parsed);
      setTimeout(() => {
        setPaused(false);
        setLastCode(null);
      }, 2000);
    },
    [paused, lastCode, onScanSuccess]
  );

  const { ref } = useZxing({
    paused,
    onDecodeResult(result) {
      handleResult(result.getText());
    },
    onDecodeError(error) {
      console.debug('[BarcodeScanner] Frame error:', error);
    },
  });

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl ${className}`}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Stream de vídeo da câmera */}
      <video
        ref={ref}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Overlay com viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Cantos de foco animados */}
        <div className="relative w-56 h-36">
          {/* Topo-esquerdo */}
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-md animate-pulse-ring"
                style={{ borderColor: 'var(--color-primary)' }} />
          {/* Topo-direito */}
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-md"
                style={{ borderColor: 'var(--color-primary)' }} />
          {/* Base-esquerdo */}
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-md"
                style={{ borderColor: 'var(--color-primary)' }} />
          {/* Base-direito */}
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-md"
                style={{ borderColor: 'var(--color-primary)' }} />

          {/* Linha de varredura animada */}
          <div className="absolute left-0 right-0 h-0.5 animate-bounce"
               style={{ top: '50%', background: 'var(--color-primary)', opacity: 0.8 }} />
        </div>
      </div>

      {/* Status de pausa após leitura */}
      {paused && (
        <div
          className="absolute inset-0 flex items-center justify-center animate-fade-in-up"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="glass-card px-6 py-4 text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              ✓ Código Lido!
            </p>
            <p className="text-sm mt-1 opacity-75" style={{ color: 'var(--color-foreground)' }}>
              Buscando produto...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
