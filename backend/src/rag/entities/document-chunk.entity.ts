import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_chunks_document')
  @Column({ type: 'uuid', name: 'document_id' })
  documentId: string;

  @Column({ type: 'text', name: 'chunk_text' })
  chunkText: string;

  @Column({ type: 'int', name: 'chunk_index' })
  chunkIndex: number;

  @Column({ type: 'vector' as any, name: 'embedding', nullable: true })
  embedding: number[] | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Document, (document) => document.chunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;
}
