# URL Shortening Service

A clean architecture URL shortening service built with Node.js, Express, TypeScript, and Prisma.

## Features

- Create short URLs with optional custom codes
- Redirect to original URLs with click tracking
- View URL statistics
- Clean architecture with dependency injection
- PostgreSQL database with Prisma ORM
- Docker containerization
- TypeScript for type safety

## API Endpoints

- `POST /api/urls` - Create a short URL
- `GET /api/urls` - Get all URLs
- `GET /api/urls/:shortCode/stats` - Get URL statistics
- `GET /:shortCode` - Redirect to original URL
- `GET /health` - Health check

## Setup

### Local Development

1. Use the correct Node.js version:
```bash
nvm use  # Uses Node.js 22 from .nvmrc
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL

5. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:migrate
```

6. Check code quality:
```bash
npm run check-all    # Type check + lint + format check
```

7. Start development server:
```bash
npm run dev
```

### Docker

#### Production
```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

#### Development
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Run migrations in development
docker-compose exec app npx prisma migrate dev
```

#### Build Optimization
The Dockerfile uses multi-stage builds for optimal caching:
- **deps**: Installs production dependencies (cached by package.json changes)
- **builder**: Builds the application with dev dependencies
- **runtime**: Final lightweight image with only production files

## Usage Examples

### Create a short URL
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com"}'
```

### Create with custom code
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com", "customCode": "my-link"}'
```

### Get URL statistics
```bash
curl http://localhost:3000/api/urls/abc123/stats
```

## Architecture

The project follows clean architecture principles:

- **Domain**: Core business logic and interfaces
- **Application**: Use cases and service implementations
- **Infrastructure**: External concerns (database, repositories)
- **Presentation**: HTTP controllers and routes

## Technologies

- Node.js 22+ (ESM modules)
- Express.js
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL
- Docker (multi-stage builds)
- ESLint v9 (flat config)
- Prettier (integrated with ESLint)
- Vitest (testing framework)
- Faker.js (test data generation)
- nanoid for short code generation
