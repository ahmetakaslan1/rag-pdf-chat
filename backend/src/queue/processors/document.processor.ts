import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RagService } from '../../rag/rag.service';
import { Document } from '../../documents/entities/document.entity';
import { DOCUMENT_QUEUE } from '../constants/queue-names';
import { logErrorToFile } from '../../common/utils/logger';
import { EventsGateway } from '../../chat/events.gateway';

@Processor(DOCUMENT_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly ragService: RagService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly eventsGateway: EventsGateway,
  ) {
    super();
  }

  async process(job: Job<{ documentId: string; filePath: string; room: string }>) {
    const { documentId, filePath, room } = job.data;

    try {
      const doc = await this.documentRepository.findOne({
        where: { id: documentId },
        select: { id: true },
      });
      if (!doc) {
        this.logger.log(`Document ${documentId} deleted before processing could start.`);
        return;
      }

      this.eventsGateway.sendProgress(room, { documentId, status: 'parsing', percent: 10 });

      const fileBuffer = await fs.promises.readFile(filePath);
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: fileBuffer });
      const result = await parser.getText();
      const text = result.text.replace(/\0/g, '');

      const docExists = await this.documentRepository.findOne({
        where: { id: documentId },
        select: { id: true },
      });
      if (!docExists) {
        this.logger.log(`Document ${documentId} deleted during parsing.`);
        return;
      }

      await this.documentRepository.update(documentId, { parsedContent: text });

      this.eventsGateway.sendProgress(room, { documentId, status: 'chunking', percent: 30 });

      await this.ragService.processAndStoreChunks(documentId, text, (percent) => {
        const adjustedPercent = 30 + Math.round(percent * 0.65);
        this.eventsGateway.sendProgress(room, {
          documentId,
          status: 'embedding',
          percent: adjustedPercent,
        });
      });

      this.eventsGateway.sendProgress(room, { documentId, status: 'completed', percent: 100 });
    } catch (error) {
      const doc = await this.documentRepository.findOne({
        where: { id: documentId },
        select: { id: true },
      });
      if (!doc) {
        this.logger.log(`Document processing aborted because document ${documentId} was deleted.`);
        return;
      }

      this.logger.error(`Document processing failed: ${documentId}`, error);
      logErrorToFile(error, 'DocumentProcessor');
      this.eventsGateway.sendProgress(room, {
        documentId,
        status: 'failed',
        percent: 0,
        error: 'Doküman işlenirken bir hata oluştu.',
      });
      throw error;
    }
  }
}
