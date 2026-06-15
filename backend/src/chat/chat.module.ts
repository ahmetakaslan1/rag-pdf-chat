import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EventsGateway } from './events.gateway';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { RagModule } from '../rag/rag.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, Message]),
    RagModule,
    GeminiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, EventsGateway],
  exports: [EventsGateway],
})
export class ChatModule {}
