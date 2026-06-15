import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService, STORAGE_STRATEGY } from './storage.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';

@Module({
  providers: [
    {
      provide: STORAGE_STRATEGY,
      useFactory: (configService: ConfigService) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local');

        if (storageType === 's3') {
          return new S3StorageStrategy(configService);
        }

        return new LocalStorageStrategy(configService);
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
