import { Injectable } from '@nestjs/common';
import { validarCNPJ } from './validators/cnpj.validator';

export interface DadosCNPJ {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  uf: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  cep: string;
}

interface CircuitBreakerState {
  falhas: number;
  ultimaFalha: number;
  aberto: boolean;
}

@Injectable()
export class CnpjService {
  private static readonly MAX_FALHAS = 3;
  private static readonly TEMPO_RESET = 20_000;
  private static readonly TIMEOUT = 10_000;
  private circuitBreaker: CircuitBreakerState = { falhas: 0, ultimaFalha: 0, aberto: false };

  validarLocalmente(cnpj: string): boolean {
    return validarCNPJ(cnpj);
  }

  async consultarCNPJ(cnpj: string): Promise<DadosCNPJ | null> {
    if (this.circuitBreaker.aberto) {
      if (Date.now() - this.circuitBreaker.ultimaFalha >= CnpjService.TEMPO_RESET) {
        this.circuitBreaker.aberto = false;
        this.circuitBreaker.falhas = 0;
      } else {
        throw new Error('Serviço de consulta CNPJ temporariamente indisponível.');
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CnpjService.TIMEOUT);

      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeout);

      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`BrasilAPI retornou ${res.status}`);

      const data = await res.json();
      this.circuitBreaker.falhas = 0;

      return {
        cnpj: data.cnpj,
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        situacaoCadastral: data.descricao_situacao_cadastral || '',
        uf: data.uf || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        cep: data.cep || '',
      };
    } catch (err: any) {
      this.circuitBreaker.falhas++;
      this.circuitBreaker.ultimaFalha = Date.now();
      if (this.circuitBreaker.falhas >= CnpjService.MAX_FALHAS) {
        this.circuitBreaker.aberto = true;
      }
      throw err;
    }
  }
}
