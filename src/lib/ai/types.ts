/**
 * AI Client Types
 * Common interfaces for all AI providers
 */

export type AIProvider = 'deepseek' | 'glm' | 'qwen';

export interface AIClientConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  created: number;
}

export interface IAIClient {
  /**
   * Get chat completion from AI provider
   */
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  /**
   * Get the provider name
   */
  getProvider(): AIProvider;

  /**
   * Get the model name
   */
  getModel(): string;

  /**
   * Health check for the AI provider
   */
  healthCheck(): Promise<boolean>;
}
