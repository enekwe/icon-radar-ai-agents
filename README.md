# Icon Radar AI Agents Microservice

AI-powered brand discovery, verification, metrics collection, and scoring for Icon Radar platform.

## Overview

The AI Agents microservice provides four specialized agents:

1. **BrandLink Agent**: Brand discovery through web scraping and AI extraction
2. **BizDataClean Agent**: Ownership verification using multiple data sources
3. **BrandTrend Agent**: Social media metrics collection and analysis
4. **ChampionIndex Agent**: Brand scoring and ranking calculations

## Architecture

```
icon-radar-ai-agents/
├── src/
│   ├── index.ts                 # Service entry point
│   ├── routes/
│   │   └── agents.ts            # API routes
│   ├── controllers/
│   │   └── agentController.ts   # Request handlers
│   ├── services/
│   │   ├── brandlinkService.ts      # Brand discovery
│   │   ├── bizdatacleanService.ts   # Ownership verification
│   │   ├── brandtrendService.ts     # Metrics collection
│   │   ├── championindexService.ts  # Scoring & ranking
│   │   ├── langflowClient.ts        # Langflow integration
│   │   └── orchestrationService.ts  # Pipeline orchestration
│   ├── middleware/
│   │   ├── auth.ts              # Authentication
│   │   └── validation.ts        # Request validation
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── utils/
│       └── logger.ts            # Winston logger
├── __tests__/                    # Test suite
├── Dockerfile                    # Container definition
└── package.json
```

## API Endpoints

### BrandLink Agent
```
POST /api/v1/agents/brandlink/discover
```
Discover brands for an athlete through web scraping and AI extraction.

**Request:**
```json
{
  "athleteId": "uuid",
  "athleteName": "LeBron James",
  "sport": "Basketball",
  "maxResults": 20
}
```

### BizDataClean Agent
```
POST /api/v1/agents/bizdataclean/verify
```
Verify ownership relationships using Crunchbase, LinkedIn, and other sources.

**Request:**
```json
{
  "brandName": "SpringHill Entertainment",
  "athleteName": "LeBron James",
  "brandId": "uuid",
  "athleteId": "uuid"
}
```

### BrandTrend Agent
```
POST /api/v1/agents/brandtrend/collect
```
Collect social media metrics from Instagram, TikTok, LinkedIn, etc.

**Request:**
```json
{
  "brandName": "SpringHill Entertainment",
  "brandId": "uuid",
  "socialProfiles": {
    "instagram": "@springhill",
    "tiktok": "@springhill",
    "linkedin": "springhill-entertainment"
  },
  "website": "https://springhillentertainment.com"
}
```

### ChampionIndex Agent
```
POST /api/v1/agents/championindex/calculate
```
Calculate Champion Index score based on 14 weighted metrics.

**Request:**
```json
{
  "brandId": "uuid",
  "athleteId": "uuid"
}
```

### Pipeline Orchestration
```
POST /api/v1/agents/pipeline/execute
```
Execute multiple agents in sequence.

**Request:**
```json
{
  "athleteId": "uuid",
  "brandId": "uuid",
  "steps": ["discovery", "verification", "metrics", "scoring"],
  "priority": "high"
}
```

### Job Status
```
GET /api/v1/agents/status/:jobId
GET /api/v1/agents/results/:jobId
```

### Health Checks
```
GET /health
GET /health/ready
GET /health/live
```

## Environment Variables

```bash
# Service Configuration
PORT=3009
SERVICE_NAME=ai-agents
NODE_ENV=production

# Database & Redis
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Service Discovery
AUTH_SERVICE_URL=http://localhost:3001
EXTERNAL_APIS_URL=http://localhost:3008
ATHLETE_SERVICE_URL=http://localhost:3002
BRAND_SERVICE_URL=http://localhost:3003

# Security
JWT_SECRET=your-secret-key
SERVICE_API_KEY=your-service-api-key

# AI Providers
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
META_API_KEY=...

# External APIs
CRUNCHBASE_API_KEY=...
LINKEDIN_ACCESS_TOKEN=...
META_ACCESS_TOKEN=...
TIKTOK_ACCESS_TOKEN=...
SEMRUSH_API_KEY=...

# Langflow
LANGFLOW_URL=http://localhost:7860
LANGFLOW_API_KEY=...
```

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

## Docker Deployment

```bash
# Build image
docker build -t icon-radar-ai-agents .

# Run container
docker run -p 3009:3009 --env-file .env icon-radar-ai-agents
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Features

### Multi-AI Provider Support
- OpenAI GPT-4
- Google Gemini Pro
- Anthropic Claude
- Meta LLaMA

### Web Scraping Sources
- ESPN
- Forbes
- Sports Illustrated
- The Athletic
- Sports Business Journal
- And more...

### External API Integrations
- Crunchbase (company data)
- LinkedIn (professional profiles)
- Meta/Instagram (social metrics)
- TikTok (video metrics)
- Semrush (website traffic)

### Langflow Integration
- Flow-based AI orchestration
- Visual workflow management
- Custom component support
- Real-time execution monitoring

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [...]
}
```

## Authentication

All endpoints require service-to-service authentication via API key:

```
x-service-api-key: your-service-api-key
```

## Monitoring

The service exposes health check endpoints and logs all operations using Winston logger.

## Performance

- Built-in caching with configurable TTL
- Rate limiting for external APIs
- Circuit breaker pattern for resilience
- Connection pooling for database
- Asynchronous processing for long-running jobs

## License

MIT

## Support

For issues and questions, please contact the Icon Radar development team.
