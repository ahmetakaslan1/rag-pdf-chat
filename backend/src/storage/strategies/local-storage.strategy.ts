import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageStrategy } from '../interfaces/storage-strategy.interface';

@Injectable()
export class LocalStorageStrategy implements IStorageStrategy {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('LOCAL_UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get<string>('LOCAL_BASE_URL', 'http://localhost:3000');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return `${this.baseUrl}/uploads/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/uploads/').pop();
    if (!fileName) return;

    const filePath = path.join(this.uploadDir, fileName);

    try {
      await fs.promises.unlink(filePath);
    } catch {
      // dosya zaten silinmişse hata fırlatma
    }
  }
}
