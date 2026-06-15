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
import { Document } from '../../documents/entities/document.entity';
import { Message } from './message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'document_id' })
  documentId: string;

  @Index('idx_sessions_user')
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Index('idx_sessions_temp')
  @Column({ type: 'uuid', name: 'temporary_id', nullable: true })
  temporaryId: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Yeni Sohbet' })
  title: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Document, (document) => document.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];
}
