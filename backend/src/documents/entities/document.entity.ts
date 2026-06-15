import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatSession } from '../../chat/entities/chat-session.entity';
import { DocumentChunk } from '../../rag/entities/document-chunk.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_docs_user')
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Index('idx_docs_temp')
  @Column({ type: 'uuid', name: 'temporary_id', nullable: true })
  temporaryId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 500, name: 'storage_url' })
  storageUrl: string;

  @Column({ type: 'text', name: 'parsed_content', nullable: true })
  parsedContent: string | null;

  @Index('idx_docs_created')
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ChatSession, (session) => session.document)
  chatSessions: ChatSession[];

  @OneToMany(() => DocumentChunk, (chunk) => chunk.document)
  chunks: DocumentChunk[];
}
