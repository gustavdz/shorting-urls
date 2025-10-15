# Development Guide - URL Shortening Service

## Architecture Overview

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/          # Core business logic (entities, interfaces)
├── application/     # Use cases and service implementations
├── infrastructure/  # External concerns (database, repositories)
└── presentation/    # HTTP layer (controllers, routes)
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)
- **Entities**: Core business objects (e.g., `Url.ts`)
- **Repository Interfaces**: Data access contracts
- **Service Interfaces**: Business logic contracts
- **Rules**: No dependencies on other layers

### Application Layer (`src/application/`)
- **Service Implementations**: Business logic implementation
- **Use Cases**: Orchestrate domain objects and repositories
- **Rules**: Can depend on domain layer only

### Infrastructure Layer (`src/infrastructure/`)
- **Repository Implementations**: Data access using Prisma
- **Database Configuration**: Prisma client setup
- **Container**: Dependency injection setup
- **Rules**: Can depend on domain and application layers

### Presentation Layer (`src/presentation/`)
- **Controllers**: HTTP request/response handling
- **Routes**: URL routing configuration
- **App Configuration**: Express app setup
- **Rules**: Can depend on all other layers

## Development Patterns

### Adding New Features

1. **Start with Domain**:
   ```typescript
   // 1. Define entity in src/domain/entities/
   export interface NewEntity {
     id: string;
     // properties
   }
   
   // 2. Define repository interface in src/domain/repositories/
   export interface NewEntityRepository {
     create(data: CreateData): Promise<NewEntity>;
     findById(id: string): Promise<NewEntity | null>;
   }
   
   // 3. Define service interface in src/domain/services/
   export interface NewEntityService {
     createEntity(request: CreateRequest): Promise<CreateResponse>;
   }
   ```

2. **Implement Application Layer**:
   ```typescript
   // src/application/services/NewEntityServiceImpl.ts
   export class NewEntityServiceImpl implements NewEntityService {
     constructor(private repository: NewEntityRepository) {}
     
     async createEntity(request: CreateRequest): Promise<CreateResponse> {
       // Business logic here
     }
   }
   ```

3. **Implement Infrastructure**:
   ```typescript
   // src/infrastructure/repositories/PrismaNewEntityRepository.ts
   export class PrismaNewEntityRepository implements NewEntityRepository {
     constructor(private prisma: PrismaClient) {}
     
     async create(data: CreateData): Promise<NewEntity> {
       return await this.prisma.newEntity.create({ data });
     }
   }
   ```

4. **Add to Container**:
   ```typescript
   // src/infrastructure/container.ts
   const newEntityRepository = new PrismaNewEntityRepository(prisma);
   const newEntityService = new NewEntityServiceImpl(newEntityRepository);
   const newEntityController = new NewEntityController(newEntityService);
   ```

5. **Create Presentation Layer**:
   ```typescript
   // src/presentation/controllers/NewEntityController.ts
   export class NewEntityController {
     constructor(private service: NewEntityService) {}
     
     createEntity = async (req: Request, res: Response): Promise<void> => {
       // HTTP handling
     };
   }
   ```

### Database Changes

1. **Update Prisma Schema**:
   ```prisma
   // prisma/schema.prisma
   model NewEntity {
     id        String   @id @default(cuid())
     // fields
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     
     @@map("new_entities")
   }
   ```

2. **Generate and Migrate**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

### Error Handling Patterns

```typescript
// Service Layer - Throw descriptive errors
if (!validator.isURL(longUrl)) {
  throw new Error('Invalid URL provided');
}

// Controller Layer - Catch and return HTTP responses
try {
  const result = await this.service.method(data);
  res.status(201).json(result);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(400).json({ error: message });
}
```

## Code Standards

### Code Quality Tools
- **ESLint v9**: Latest flat config format with TypeScript integration
- **Prettier**: Code formatting with ESLint compatibility
- **TypeScript**: Strict type checking with enhanced compiler options

### Modern ESLint Configuration
Using ESLint v9 flat config (`eslint.config.js`) with:
- `typescript-eslint` v7 for TypeScript support
- Prettier integration via `eslint-config-prettier`
- Type-aware linting with project references

### Unified Workflow
```bash
npm run check-all    # Type check + lint + format check
npm run format       # Prettier format + ESLint fix
npm run lint:fix     # ESLint auto-fix only
```

### Pre-commit Workflow
```bash
npm run check-all    # Single command for all checks
# OR run individually:
npm run type-check   # Check TypeScript types
npm run format:check # Check formatting and linting
```

### Auto-fix Everything
```bash
npm run format       # Prettier + ESLint fixes
npm run lint:fix     # ESLint fixes only
```

### Enhanced TypeScript Configuration
- `noUnusedLocals` & `noUnusedParameters`: Catch unused code
- `exactOptionalPropertyTypes`: Stricter optional properties
- `noImplicitReturns`: Ensure all code paths return
- `noUncheckedIndexedAccess`: Safer array/object access

### ESLint v9 Features
- **Flat Config**: Modern `eslint.config.js` format
- **Better Performance**: Improved parsing and rule execution
- **TypeScript Integration**: Native support via `typescript-eslint` v7
- **Simplified Setup**: No more `.eslintrc.json` complexity

### Configuration Files
- `eslint.config.js` - ESLint v9 flat configuration
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - TypeScript compiler options

### TypeScript
- Use strict mode (enabled in `tsconfig.json`)
- Define interfaces for all data structures
- Use async/await over promises
- Prefer `const` over `let`

### Naming Conventions
- **Files**: PascalCase for classes, camelCase for utilities
- **Classes**: PascalCase (e.g., `UrlController`)
- **Interfaces**: PascalCase (e.g., `UrlRepository`)
- **Methods**: camelCase (e.g., `createShortUrl`)
- **Constants**: UPPER_SNAKE_CASE

### Import Patterns
```typescript
// Use path aliases
import { Url } from '@/domain/entities/Url';
import { UrlRepository } from '@/domain/repositories/UrlRepository';

// Group imports: external, internal, relative
import express from 'express';
import { UrlService } from '@/domain/services/UrlService';
import { createContainer } from './container';
```

## Testing Guidelines

### Unit Tests Structure
```typescript
// tests/unit/services/UrlServiceImpl.test.ts
describe('UrlServiceImpl', () => {
  let service: UrlServiceImpl;
  let mockRepository: jest.Mocked<UrlRepository>;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByShortCode: jest.fn(),
      // ...
    };
    service = new UrlServiceImpl(mockRepository, 'http://test.com');
  });
  
  describe('createShortUrl', () => {
    it('should create short URL with valid input', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests
- Test complete request/response cycles
- Use test database
- Mock external dependencies only

## Environment Setup

### Required Environment Variables
```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
BASE_URL="http://localhost:3000"
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint (includes Prettier checks)
npm run lint:fix     # Fix ESLint and Prettier issues automatically
npm run format       # Alias for lint:fix
npm run format:check # Alias for lint
npm run type-check   # Run TypeScript type checking
npm run check-all    # Run type-check + lint together
```

### Node.js Version Management
```bash
# Use the correct Node.js version
nvm use              # Uses version specified in .nvmrc (22)
nvm install          # Install Node.js 22 if not present
```

## Common Tasks

### Adding New API Endpoint
1. Define in service interface
2. Implement in service class
3. Add controller method
4. Add route in `urlRoutes.ts`
5. Update container if needed

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Update TypeScript interfaces
4. Update repository implementations

### Adding Validation
```typescript
// Use validator library in service layer
import validator from 'validator';

if (!validator.isURL(longUrl)) {
  throw new Error('Invalid URL provided');
}
```

## Deployment

### Docker Multi-Stage Build
The Dockerfile uses three optimized stages:

1. **deps**: Production dependencies only
   - Cached by `package.json` and `package-lock.json`
   - Includes Prisma schema for client generation

2. **builder**: Build stage
   - Installs all dependencies (including dev)
   - Generates Prisma client
   - Compiles TypeScript to JavaScript

3. **runtime**: Final production image
   - Copies only production dependencies and built files
   - Runs as non-root user
   - Includes health checks

### Docker Commands
```bash
# Production build
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Build specific stage
docker build --target builder -t shorting-urls:builder .
docker build --target runtime -t shorting-urls:runtime .
```

### Build Optimization Benefits
- **Layer Caching**: Dependencies cached separately from source code
- **Smaller Images**: Production image excludes dev dependencies and source
- **Security**: Non-root user execution
- **Health Checks**: Built-in container health monitoring
- **Version Documentation**: `.nvmrc` included for Node.js version reference

### Node.js Version Consistency
The `.nvmrc` file is copied to the Docker image to:
- Document the exact Node.js version used
- Enable version verification in containers
- Maintain consistency between local and containerized environments
- Support CI/CD pipelines that read `.nvmrc`

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health check endpoint working
- [ ] Logging configured
- [ ] Security headers enabled (helmet)
- [ ] CORS configured properly

## Troubleshooting

### Common Issues
1. **Prisma Client not generated**: Run `npm run db:generate`
2. **Database connection failed**: Check `DATABASE_URL` in `.env`
3. **TypeScript errors**: Ensure all dependencies are installed
4. **Port already in use**: Change `PORT` in `.env`

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

This guide ensures consistent development practices and helps maintain the clean architecture principles throughout the project lifecycle.
