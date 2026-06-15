import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DOCUMENT_QUEUE } from './constants/queue-names';
import { DocumentProcessor } from './processors/document.processor';
import { RagModule } from '../rag/rag.module';
import { Document } from '../documents/entities/document.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({ name: DOCUMENT_QUEUE }),
    TypeOrmModule.forFeature([Document]),
    RagModule,
    ChatModule,
  ],
  providers: [DocumentProcessor],
  exports: [BullModule],
})
export class QueueModule {}
