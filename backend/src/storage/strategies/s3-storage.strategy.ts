import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageStrategy } from '../interfaces/storage-strategy.interface';

@Injectable()
export class S3StorageStrategy implements IStorageStrategy {
  constructor(private readonly configService: ConfigService) {
    // AWS SDK initialization:
    // const s3Client = new S3Client({ credentials: ... });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.configService.get<string>('S3_BUCKET_NAME');
    const uniqueFileName = `${Date.now()}-${file.originalname}`;

    // AWS SDK upload:
    // await this.s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: uniqueFileName, Body: file.buffer }));

    return `https://${bucket}.s3.amazonaws.com/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // const key = fileUrl.split('.com/').pop();
    // await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
