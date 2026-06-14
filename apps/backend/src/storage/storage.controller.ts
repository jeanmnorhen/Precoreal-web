import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class GenerateUploadUrlDto {
  originalFilename: string;
  prefix: string;
}

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    const pathname = this.storageService.generatePathname(
      dto.originalFilename,
      dto.prefix,
    );

    return { pathname };
  }
}
