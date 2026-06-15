import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly storageService: StorageService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupGuestData() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredDocs = await this.documentRepository.find({
      where: {
        userId: IsNull(),
        createdAt: LessThan(thirtyMinutesAgo),
      },
    });

    for (const doc of expiredDocs) {
      try {
        await this.storageService.deleteFile(doc.storageUrl);
      } catch {
        this.logger.warn(`Dosya silinemedi: ${doc.storageUrl}`);
      }
    }

    if (expiredDocs.length > 0) {
      await this.documentRepository.remove(expiredDocs);
      this.logger.log(`${expiredDocs.length} misafir doküman temizlendi.`);
    }
  }
}
