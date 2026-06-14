export interface ProdutoScanResultado {
  gtin: string;
  lote?: string;
  validade?: Date;
}

export class GS1ApplicationParser {
  /**
   * Executa a limpeza e análise sintática de padrões lineares (EAN-13) e bidimensionais (GS1 DataMatrix)
   * @param rawCode String crua oriunda do leitor de câmera
   */
  public static parse(rawCode: string): ProdutoScanResultado {
    const cleaned = rawCode.trim();

    // Cenário A: Código de barras linear tradicional (EAN-13 / GTIN-13)
    if (/^\d{13}$/.test(cleaned)) {
      return { gtin: cleaned };
    }

    // Cenário B: Código estruturado GS1 DataMatrix (Ex: 01078912345678901726123110ABC123)
    if (cleaned.startsWith('01') || cleaned.includes('(01)')) {
      // Normalização: Remove parênteses caso o leitor os adicione automaticamente
      const normalized = cleaned.replace(/[\(\)]/g, '');
      
      const gtinMatch = normalized.match(/^01(\d{14})/);
      const validadeMatch = normalized.match(/17(\d{6})/);
      const loteMatch = normalized.match(/10([A-Za-z0-9]+)$/);

      if (gtinMatch) {
        // Converte o GTIN-14 removendo o zero à esquerda para corresponder ao padrão de busca EAN-13
        const extractedGtin = gtinMatch[1].replace(/^0+/, '');
        
        let validadeData: Date | undefined;
        if (validadeMatch) {
          const year = 2000 + parseInt(validadeMatch[1].substring(0, 2), 10);
          const month = parseInt(validadeMatch[1].substring(2, 4), 10) - 1;
          const day = parseInt(validadeMatch[1].substring(4, 6), 10);
          validadeData = new Date(year, month, day);
        }

        return {
          gtin: extractedGtin,
          validade: validadeData,
          lote: loteMatch ? loteMatch[1] : undefined
        };
      }
    }

    // Fallback seguro de higienização de string para mitigar SQL Injection ou caracteres corrompidos
    return { gtin: cleaned.replace(/[^A-Za-z0-9]/g, '') };
  }
}
