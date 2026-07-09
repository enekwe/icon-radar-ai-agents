/**
 * Langflow API Client for AI agent orchestration
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@enekwe/icon-radar-shared';

export interface FlowExecutionResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  outputs?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class LangflowClient {
  private axiosInstance: AxiosInstance;

  constructor(
    private baseURL: string = process.env.LANGFLOW_URL || 'http://localhost:7860',
    private apiKey?: string
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.LANGFLOW_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
  }

  async executeFlow(flowId: string, inputs: any): Promise<FlowExecutionResult> {
    try {
      logger.info(`Langflow: Executing flow ${flowId}`, { inputs });

      const response = await this.axiosInstance.post(`/api/v1/run/${flowId}`, {
        inputs,
        config: {
          timeout: 30000,
          priority: 'normal'
        }
      });

      const result: FlowExecutionResult = {
        id: response.data.run_id || response.data.id,
        status: response.data.status || 'running',
        outputs: response.data.outputs,
        error: response.data.error,
        startTime: new Date(response.data.start_time || Date.now()),
        endTime: response.data.end_time ? new Date(response.data.end_time) : undefined,
        duration: response.data.duration
      };

      logger.info(`Langflow: Flow execution started`, { flowId, runId: result.id });
      return result;
    } catch (error) {
      logger.error(`Langflow: Flow execution failed`, { flowId, error });
      throw error;
    }
  }

  async getFlowStatus(runId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/api/v1/runs/${runId}/status`);
      return response.data;
    } catch (error) {
      logger.error(`Langflow: Failed to get flow status`, { runId, error });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.warn('Langflow health check failed', error);
      return false;
    }
  }
}

export const langflowClient = new LangflowClient(
  process.env.LANGFLOW_URL,
  process.env.LANGFLOW_API_KEY
);
