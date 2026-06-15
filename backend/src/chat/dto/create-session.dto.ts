import { IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  documentId: string;
}
