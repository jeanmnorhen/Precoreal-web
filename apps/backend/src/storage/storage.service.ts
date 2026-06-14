import { Injectable } from '@nestjs/common';
import { del, list } from '@vercel/blob';

@Injectable()
export class StorageService {
  /**
   * Gera um pathname seguro com UUID para evitar colisões de nome de arquivo
   * O upload real acontece do cliente direto para o Vercel Blob
   */
  generatePathname(originalFilename: string, prefix: string): string {
    const extension = originalFilename.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }

  /**
   * Deleta um arquivo do Vercel Blob pelo seu URL completo
   */
  async deleteFile(url: string): Promise<void> {
    await del(url);
  }

  /**
   * Lista arquivos em um prefixo específico do Blob store
   */
  async listFiles(prefix: string) {
    const { blobs } = await list({ prefix });
    return blobs;
  }
}
