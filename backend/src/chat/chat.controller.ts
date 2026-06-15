import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { OwnerContext } from '../common/interfaces/owner-context.interface';

@Public()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession(
    @Body() dto: CreateSessionDto,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.chatService.createSession(dto.documentId, owner);
  }

  @Get('sessions')
  getSessions(@CurrentUser() owner: OwnerContext) {
    return this.chatService.getSessions(owner);
  }

  @Get('sessions/:id/messages')
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.chatService.getMessages(id, owner);
  }

  @Post('sessions/:id/messages')
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.chatService.sendMessage(id, dto.content, owner);
  }

  @Patch('sessions/:id')
  updateSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.chatService.updateSessionTitle(id, dto.title, owner);
  }

  @Delete('sessions/:id')
  deleteSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() owner: OwnerContext,
  ) {
    return this.chatService.deleteSession(id, owner);
  }
}
