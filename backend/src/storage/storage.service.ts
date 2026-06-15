import { Injectable, Inject } from '@nestjs/common';
import type { IStorageStrategy } from './interfaces/storage-strategy.interface';

export const STORAGE_STRATEGY = 'STORAGE_STRATEGY';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_STRATEGY)
    private readonly strategy: IStorageStrategy,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.strategy.uploadFile(file);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.strategy.deleteFile(fileUrl);
  }
}
