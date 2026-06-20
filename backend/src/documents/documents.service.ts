import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Document } from './entities/document.entity';
import { StorageService } from '../storage/storage.service';
import type { OwnerContext } from '../common/interfaces/owner-context.interface';
import { DOCUMENT_QUEUE } from '../queue/constants/queue-names';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly storageService: StorageService,
    @InjectQueue(DOCUMENT_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  async validatePdf(file: Express.Multer.File): Promise<void> {
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Sadece PDF dosyaları kabul edilmektedir.');
    }

    const pdfHeader = file.buffer.subarray(0, 5).toString('ascii');
    if (pdfHeader !== '%PDF-') {
      throw new BadRequestException(
        'Geçersiz dosya formatı. Dosya gerçek bir PDF olmalıdır.',
      );
    }
  }

  async upload(file: Express.Multer.File, owner: OwnerContext) {
    const storageUrl = await this.storageService.uploadFile(file);

    const document = this.documentRepository.create({
      userId: owner.userId || null,
      temporaryId: owner.temporaryId || null,
      fileName: file.originalname,
      storageUrl,
    });

    const saved = await this.documentRepository.save(document);

    const room = owner.userId || owner.temporaryId || saved.id;

    await this.documentQueue.add(
      'process-document',
      {
        documentId: saved.id,
        filePath: `./uploads/${storageUrl.split('/').pop()}`,
        room,
      },
      { jobId: saved.id },
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Doküman yüklendi ve işleme kuyruğuna alındı.',
      documentId: saved.id,
    };
  }

  async getDocuments(owner: OwnerContext): Promise<Document[]> {
    if (!owner.isAuthenticated && !owner.temporaryId) {
      return [];
    }

    const where = owner.isAuthenticated
      ? { userId: owner.userId }
      : { temporaryId: owner.temporaryId };

    return this.documentRepository.find({
      where,
      order: { createdAt: 'DESC' },
      select: { id: true, fileName: true, createdAt: true },
    });
  }

  async getDocument(id: string, owner: OwnerContext): Promise<Document> {
    const where: any = { id };

    if (owner.isAuthenticated) {
      where.userId = owner.userId;
    } else if (owner.temporaryId) {
      where.temporaryId = owner.temporaryId;
    } else {
      throw new ForbiddenException('Erişim reddedildi.');
    }

    const document = await this.documentRepository.findOne({ where });

    if (!document) {
      throw new ForbiddenException('Bu dokümana erişim izniniz yok.');
    }

    return document;
  }

  async delete(id: string, owner: OwnerContext): Promise<void> {
    const where: any = { id };

    if (owner.isAuthenticated) {
      where.userId = owner.userId;
    } else if (owner.temporaryId) {
      where.temporaryId = owner.temporaryId;
    } else {
      throw new ForbiddenException('Erişim reddedildi.');
    }

    const document = await this.documentRepository.findOne({ where });

    if (!document) {
      throw new ForbiddenException('Bu dokümanı silme izniniz yok.');
    }

    await this.storageService.deleteFile(document.storageUrl);

    try {
      const job = await this.documentQueue.getJob(id);
      if (job) {
        await job.remove();
      }
    } catch {}

    await this.documentRepository.delete(id);
  }
}
