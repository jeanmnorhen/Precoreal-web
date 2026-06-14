import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { usuarios } from '@precoreal/shared';
import { eq } from 'drizzle-orm';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.database;
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const [user] = await this.db
      .update(usuarios)
      .set(dto)
      .where(eq(usuarios.id, id))
      .returning();

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }
}
