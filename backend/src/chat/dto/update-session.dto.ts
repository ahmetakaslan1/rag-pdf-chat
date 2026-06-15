import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
}
