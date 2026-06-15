import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { SenderType } from '../common/enums/sender-type.enum';
import type { OwnerContext } from '../common/interfaces/owner-context.interface';
import { RagService } from '../rag/rag.service';
import { GeminiService } from '../gemini/gemini.service';
import { EventsGateway } from './events.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly ragService: RagService,
    private readonly geminiService: GeminiService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createSession(documentId: string, owner: OwnerContext): Promise<ChatSession> {
    const session = this.sessionRepository.create({
      documentId,
      userId: owner.userId || null,
      temporaryId: owner.temporaryId || null,
    });
    return this.sessionRepository.save(session);
  }

  async getSessions(owner: OwnerContext): Promise<ChatSession[]> {
    if (!owner.isAuthenticated && !owner.temporaryId) {
      return [];
    }

    const where = owner.isAuthenticated
      ? { userId: owner.userId }
      : { temporaryId: owner.temporaryId };

    return this.sessionRepository.find({
      where,
      relations: { document: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getMessages(sessionId: string, owner: OwnerContext): Promise<Message[]> {
    await this.verifyOwnership(sessionId, owner);

    return this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    sessionId: string,
    content: string,
    owner: OwnerContext,
  ): Promise<Message> {
    const session = await this.verifyOwnership(sessionId, owner);

    const userMessage = this.messageRepository.create({
      sessionId,
      sender: SenderType.USER,
      content,
    });
    await this.messageRepository.save(userMessage);

    this.eventsGateway.sendMessage(sessionId, userMessage);

    const history = await this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    const context = await this.ragService.buildContext(session.documentId, content);

    const aiResponse = await this.geminiService.generateChatResponse(
      context,
      content,
      history.map((m) => ({ role: m.sender, content: m.content })),
    );

    const aiMessage = this.messageRepository.create({
      sessionId,
      sender: SenderType.AI,
      content: aiResponse,
    });
    await this.messageRepository.save(aiMessage);

    this.eventsGateway.sendMessage(sessionId, aiMessage);

    if (history.length <= 2) {
      await this.sessionRepository.update(sessionId, {
        title: content.substring(0, 100),
      });
    }

    return aiMessage;
  }

  async updateSessionTitle(sessionId: string, title: string, owner: OwnerContext): Promise<ChatSession> {
    const session = await this.verifyOwnership(sessionId, owner);
    session.title = title;
    return this.sessionRepository.save(session);
  }

  async deleteSession(sessionId: string, owner: OwnerContext): Promise<void> {
    await this.verifyOwnership(sessionId, owner);
    await this.sessionRepository.delete(sessionId);
  }

  private async verifyOwnership(
    sessionId: string,
    owner: OwnerContext,
  ): Promise<ChatSession> {
    const where: any = { id: sessionId };

    if (owner.isAuthenticated) {
      where.userId = owner.userId;
    } else if (owner.temporaryId) {
      where.temporaryId = owner.temporaryId;
    } else {
      throw new ForbiddenException('Erişim reddedildi.');
    }

    const session = await this.sessionRepository.findOne({ where });

    if (!session) {
      throw new ForbiddenException('Bu sohbete erişim izniniz yok.');
    }

    return session;
  }
}
