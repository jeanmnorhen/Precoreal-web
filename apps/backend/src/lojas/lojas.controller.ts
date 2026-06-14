import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LojasService } from './lojas.service';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('lojas')
@UseGuards(JwtAuthGuard)
export class LojasController {
  constructor(private readonly lojasService: LojasService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLojaDto) {
    return this.lojasService.create(user.userId, dto);
  }

  @Get()
  listarMinhas(@CurrentUser() user: JwtPayload) {
    return this.lojasService.findByProprietario(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lojasService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLojaDto,
  ) {
    return this.lojasService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.lojasService.delete(id, user.userId);
  }
}
