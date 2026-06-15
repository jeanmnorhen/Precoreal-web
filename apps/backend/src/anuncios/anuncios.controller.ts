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
import { AnunciosService } from './anuncios.service';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('anuncios')
@UseGuards(JwtAuthGuard)
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @Post()
  create(@Body() dto: CreateAnuncioDto) {
    return this.anunciosService.create(dto);
  }

  @Get()
  findAll() {
    return this.anunciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anunciosService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnuncioDto) {
    return this.anunciosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anunciosService.delete(id);
  }

  @Post(':id/renovar')
  renovar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.anunciosService.renovar(id, user.userId);
  }
}
