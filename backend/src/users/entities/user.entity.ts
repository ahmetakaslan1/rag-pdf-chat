import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Document } from '../../documents/entities/document.entity';
import { ChatSession } from '../../chat/entities/chat-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', length: 500, name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions: ChatSession[];
}
