import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from './entities/document-chunk.entity';
import { GeminiService } from '../gemini/gemini.service';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly geminiService: GeminiService,
  ) {}

  splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE, text.length);
      chunks.push(text.slice(start, end));
      start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks;
  }

  async processAndStoreChunks(
    documentId: string,
    text: string,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    const chunks = this.splitTextIntoChunks(text);
    const total = chunks.length;

    for (let i = 0; i < total; i++) {
      const embedding = await this.geminiService.generateEmbedding(chunks[i]);

      const chunk = this.chunkRepository.create({
        documentId,
        chunkText: chunks[i],
        chunkIndex: i,
        embedding,
      });

      await this.chunkRepository.save(chunk);

      if (onProgress) {
        const percent = Math.round(((i + 1) / total) * 100);
        onProgress(percent);
      }
    }
  }

  async searchSimilarChunks(
    documentId: string,
    query: string,
    topK: number = 5,
  ): Promise<DocumentChunk[]> {
    const queryEmbedding = await this.geminiService.generateEmbedding(query);

    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    const chunks = await this.chunkRepository
      .createQueryBuilder('chunk')
      .where('chunk.document_id = :documentId', { documentId })
      .andWhere('chunk.embedding IS NOT NULL')
      .orderBy(
        `chunk.embedding <=> '${embeddingStr}'::vector`,
        'ASC',
      )
      .limit(topK)
      .getMany();

    return chunks;
  }

  async buildContext(documentId: string, query: string): Promise<string> {
    const chunks = await this.searchSimilarChunks(documentId, query);
    return chunks.map((c) => c.chunkText).join('\n\n---\n\n');
  }
}
