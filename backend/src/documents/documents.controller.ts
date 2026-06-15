import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DocumentsService } from './documents.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { OwnerContext } from '../common/interfaces/owner-context.interface';

const GUEST_MAX_SIZE = 2 * 1024 * 1024;
const USER_MAX_SIZE = 50 * 1024 * 1024;

@Public()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: USER_MAX_SIZE } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() owner: OwnerContext,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi.');
    }

    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    if (!owner.isAuthenticated && file.size > GUEST_MAX_SIZE) {
      throw new BadRequestException('Misafir kullanıcılar için maksimum dosya boyutu 2 MB.');
    }

    await this.documentsService.validatePdf(file);

    return this.documentsService.upload(file, owner);
  }

  @Get()
  getDocuments(@CurrentUser() owner: OwnerContext) {
    return this.documentsService.getDocuments(owner);
  }

  @Get(':id')
  getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.documentsService.getDocument(id, owner);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.documentsService.delete(id, owner);
  }
}
