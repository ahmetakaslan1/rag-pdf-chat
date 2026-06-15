import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private embeddingModel: GenerativeModel;
  private chatModel: GenerativeModel;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.embeddingModel = this.genAI.getGenerativeModel({
      model: this.configService.get<string>('GEMINI_EMBEDDING_MODEL', 'gemini-embedding-2'),
    });

    this.chatModel = this.genAI.getGenerativeModel({
      model: this.configService.get<string>('GEMINI_CHAT_MODEL', 'gemini-2.5-flash'),
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results = await Promise.all(
      texts.map((text) => this.generateEmbedding(text)),
    );
    return results;
  }

  async generateChatResponse(
    context: string,
    question: string,
    history: { role: string; content: string }[],
  ): Promise<string> {
    const systemPrompt = [
      'Sen bir doküman asistanısın. Sana verilen bağlam bilgisine dayanarak soruları yanıtlıyorsun.',
      'Bağlamda bulunmayan bilgileri uydurma. Bilmediğini belirt.',
      '',
      '--- BAĞLAM ---',
      context,
      '--- BAĞLAM SONU ---',
    ].join('\n');

    const chatHistory = history.map((msg) => ({
      role: msg.role === 'USER' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }));

    const chat = this.chatModel.startChat({
      history: chatHistory,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      } as any,
    });

    const result = await chat.sendMessage(question);
    return result.response.text();
  }
}
