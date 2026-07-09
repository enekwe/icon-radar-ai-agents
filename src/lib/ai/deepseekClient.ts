/**
 * Deepseek AI Client
 * Uses OpenAI SDK with custom base URL for Deepseek API
 * Deepseek is OpenAI-compatible and very cost-effective
 */

import OpenAI from 'openai';
import { logger } from '@enekwe/icon-radar-shared';
import {
  IAIClient,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  AIClientConfig
} from './types';

export class DeepseekClient implements IAIClient {
  private client: OpenAI;
  private model: string;

  constructor(config: AIClientConfig) {
    this.model = config.model || 'deepseek-chat';

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com/v1',
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3
    });

    logger.info('Deepseek AI client initialized', { model: this.model });
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      logger.debug('Deepseek: Sending chat completion request', {
        model: this.model,
        messageCount: request.messages.length
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        top_p: request.topP ?? 1,
        stream: false // Explicitly disable streaming for type safety
      });

      logger.info('Deepseek: Chat completion successful', {
        model: this.model,
        tokens: response.usage?.total_tokens
      });

      return {
        id: response.id,
        model: response.model,
        choices: response.choices.map((choice: any) => ({
          index: choice.index,
          message: {
            role: choice.message.role as 'system' | 'user' | 'assistant',
            content: choice.message.content || ''
          },
          finishReason: choice.finish_reason
        })),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        created: response.created
      };
    } catch (error) {
      logger.error('Deepseek: Chat completion failed', { error });
      throw error;
    }
  }

  getProvider(): AIProvider {
    return 'deepseek';
  }

  getModel(): string {
    return this.model;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      });

      return response.choices.length > 0;
    } catch (error) {
      logger.warn('Deepseek: Health check failed', { error });
      return false;
    }
  }
}
