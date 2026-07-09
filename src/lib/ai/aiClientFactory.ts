/**
 * AI Client Factory
 * Creates AI clients with automatic provider selection and fallback support
 */

import { logger } from '@enekwe/icon-radar-shared';
import { DeepseekClient } from './deepseekClient';
import { GLMClient } from './glmClient';
import { QwenClient } from './qwenClient';
import { IAIClient, AIProvider, AIClientConfig } from './types';

export class AIClientFactory {
  private static primaryClient: IAIClient | null = null;
  private static fallbackClient: IAIClient | null = null;

  /**
   * Initialize AI clients based on environment configuration
   */
  static initialize(): void {
    const primaryProvider = (process.env.AI_PROVIDER_PRIMARY as AIProvider) || 'glm';
    const fallbackProvider = (process.env.AI_PROVIDER_FALLBACK as AIProvider) || 'deepseek';

    logger.info('Initializing AI clients', {
      primary: primaryProvider,
      fallback: fallbackProvider
    });

    try {
      this.primaryClient = this.createClient(primaryProvider);
      logger.info('Primary AI client initialized successfully', { provider: primaryProvider });
    } catch (error) {
      logger.error('Failed to initialize primary AI client', { provider: primaryProvider, error });
    }

    try {
      this.fallbackClient = this.createClient(fallbackProvider);
      logger.info('Fallback AI client initialized successfully', { provider: fallbackProvider });
    } catch (error) {
      logger.error('Failed to initialize fallback AI client', { provider: fallbackProvider, error });
    }

    if (!this.primaryClient && !this.fallbackClient) {
      throw new Error('Failed to initialize any AI clients. Check your API keys and configuration.');
    }
  }

  /**
   * Create an AI client for a specific provider
   */
  private static createClient(provider: AIProvider): IAIClient {
    const config = this.getProviderConfig(provider);

    switch (provider) {
      case 'glm':
        return new GLMClient(config);
      case 'deepseek':
        return new DeepseekClient(config);
      case 'qwen':
        return new QwenClient(config);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Get configuration for a specific provider from environment variables
   */
  private static getProviderConfig(provider: AIProvider): AIClientConfig {
    switch (provider) {
      case 'glm':
        return {
          provider: 'glm',
          apiKey: process.env.GLM_API_KEY || '',
          model: process.env.GLM_MODEL || 'glm-4-flash',
          baseURL: process.env.GLM_BASE_URL,
          timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
          maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3')
        };
      case 'deepseek':
        return {
          provider: 'deepseek',
          apiKey: process.env.DEEPSEEK_API_KEY || '',
          model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
          baseURL: process.env.DEEPSEEK_BASE_URL,
          timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
          maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3')
        };
      case 'qwen':
        return {
          provider: 'qwen',
          apiKey: process.env.QWEN_API_KEY || '',
          model: process.env.QWEN_MODEL || 'qwen-turbo',
          baseURL: process.env.QWEN_BASE_URL,
          timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
          maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3')
        };
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Get the primary AI client
   */
  static getPrimaryClient(): IAIClient {
    if (!this.primaryClient) {
      throw new Error('Primary AI client not initialized. Call initialize() first.');
    }
    return this.primaryClient;
  }

  /**
   * Get the fallback AI client
   */
  static getFallbackClient(): IAIClient | null {
    return this.fallbackClient;
  }

  /**
   * Get an AI client with automatic fallback
   * Tries primary first, then falls back to secondary if available
   */
  static async getClientWithFallback(): Promise<IAIClient> {
    if (this.primaryClient) {
      // Check if primary is healthy
      try {
        const isHealthy = await this.primaryClient.healthCheck();
        if (isHealthy) {
          return this.primaryClient;
        }
        logger.warn('Primary AI client health check failed, trying fallback');
      } catch (error) {
        logger.warn('Primary AI client health check error, trying fallback', { error });
      }
    }

    if (this.fallbackClient) {
      logger.info('Using fallback AI client');
      return this.fallbackClient;
    }

    if (this.primaryClient) {
      logger.warn('Fallback client not available, using primary despite health check failure');
      return this.primaryClient;
    }

    throw new Error('No AI clients available');
  }

  /**
   * Get a client for a specific provider
   */
  static getClient(provider?: AIProvider): IAIClient {
    if (!provider) {
      return this.getPrimaryClient();
    }

    if (this.primaryClient && this.primaryClient.getProvider() === provider) {
      return this.primaryClient;
    }

    if (this.fallbackClient && this.fallbackClient.getProvider() === provider) {
      return this.fallbackClient;
    }

    // Create a new client for the requested provider
    logger.info('Creating new client for provider', { provider });
    return this.createClient(provider);
  }

  /**
   * Health check for all configured clients
   */
  static async healthCheck(): Promise<{
    primary: { provider: string; healthy: boolean };
    fallback?: { provider: string; healthy: boolean };
  }> {
    const result: any = {};

    if (this.primaryClient) {
      try {
        const healthy = await this.primaryClient.healthCheck();
        result.primary = {
          provider: this.primaryClient.getProvider(),
          healthy
        };
      } catch (error) {
        result.primary = {
          provider: this.primaryClient.getProvider(),
          healthy: false
        };
      }
    }

    if (this.fallbackClient) {
      try {
        const healthy = await this.fallbackClient.healthCheck();
        result.fallback = {
          provider: this.fallbackClient.getProvider(),
          healthy
        };
      } catch (error) {
        result.fallback = {
          provider: this.fallbackClient.getProvider(),
          healthy: false
        };
      }
    }

    return result;
  }
}
