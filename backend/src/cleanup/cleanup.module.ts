import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { Document } from '../documents/entities/document.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    StorageModule,
  ],
  providers: [CleanupService],
})
export class CleanupModule {}
