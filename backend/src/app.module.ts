import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { GeminiModule } from './gemini/gemini.module';
import { QueueModule } from './queue/queue.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { OwnerContextInterceptor } from './common/interceptors/owner-context.interceptor';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get<number>('THROTTLE_TTL', 3600) * 1000,
          limit: configService.get<number>('THROTTLE_LIMIT', 3),
        },
      ]),
    }),
    AuthModule,
    UsersModule,
    StorageModule,
    DocumentsModule,
    ChatModule,
    RagModule,
    GeminiModule,
    QueueModule,
    CleanupModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OwnerContextInterceptor,
    },
  ],
})
export class AppModule {}
