# Development Guide - URL Shortening Service

## Architecture Overview

This project follows **Clean Architecture** principles with **Functional Programming** patterns:

```
src/
├── domain/          # Core business logic (entities, interfaces)
├── application/     # Use cases and service implementations
├── infrastructure/  # External concerns (database, repositories)
└── presentation/    # HTTP layer (controllers, routes)
```

## Programming Paradigms

### **Functional Programming**
- **No Classes**: All code uses factory functions and arrow functions
- **Immutable Data**: No `let` declarations or mutations
- **Pure Functions**: Functions return new values without side effects
- **Higher-Order Functions**: Functions that return configured functions

### **Arrow Functions Only**
- All functions use arrow syntax: `const fn = () => {}`
- Consistent functional style throughout
- No function declarations or class methods

## Layer Responsibilities

### Domain Layer (`src/domain/`)
- **Entities**: Core business objects (e.g., `Url.ts`)
- **Repository Interfaces**: Data access contracts
- **Service Interfaces**: Business logic contracts
- **Rules**: No dependencies on other layers

### Application Layer (`src/application/`)
- **Service Factory Functions**: Business logic implementation
- **Use Cases**: Orchestrate domain objects and repositories
- **Rules**: Can depend on domain layer only

### Infrastructure Layer (`src/infrastructure/`)
- **Repository Factory Functions**: Data access using Prisma
- **Database Configuration**: Prisma client setup
- **Container**: Dependency injection setup
- **Rules**: Can depend on domain and application layers

### Presentation Layer (`src/presentation/`)
- **Controller Factory Functions**: HTTP request/response handling
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
     create: (data: CreateData) => Promise<NewEntity>;
     findById: (id: string) => Promise<NewEntity | null>;
   }
   
   // 3. Define service interface in src/domain/services/
   export interface NewEntityService {
     createEntity: (request: CreateRequest) => Promise<CreateResponse>;
   }
   ```

2. **Implement Application Layer**:
   ```typescript
   // src/application/services/NewEntityService.ts
   export const createNewEntityService = (
     repository: NewEntityRepository
   ): NewEntityService => {
     const createEntity = async (request: CreateRequest): Promise<CreateResponse> => {
       // Business logic here
     };
     
     return { createEntity };
   };
   ```

3. **Implement Infrastructure**:
   ```typescript
   // src/infrastructure/repositories/PrismaNewEntityRepository.ts
   export const createPrismaNewEntityRepository = (
     prisma: PrismaClient
   ): NewEntityRepository => {
     const create = async (data: CreateData): Promise<NewEntity> => {
       return prisma.newEntity.create({ data });
     };
     
     return { create, findById };
   };
   ```

4. **Add to Container**:
   ```typescript
   // src/infrastructure/container.ts
   const newEntityRepository = createPrismaNewEntityRepository(prisma);
   const newEntityService = createNewEntityService(newEntityRepository);
   const newEntityController = createNewEntityController(newEntityService);
   ```

5. **Create Presentation Layer**:
   ```typescript
   // src/presentation/controllers/NewEntityController.ts
   export const createNewEntityController = (
     service: NewEntityService
   ): NewEntityControllerType => {
     const createEntity = async (req: Request, res: Response): Promise<void> => {
       // HTTP handling
     };
     
     return { createEntity };
   };
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
const validateUrl = (longUrl: string) => {
  if (!validator.isURL(longUrl)) {
    throw new Error('Invalid URL provided');
  }
};

// Controller Layer - Catch and return HTTP responses
const createShortUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.createShortUrl(data);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ error: message });
  }
};
```

## Code Standards

### Code Quality Tools
- **ESLint v9**: Latest flat config format with TypeScript integration
- **Prettier**: Code formatting integrated as ESLint rule
- **TypeScript**: Strict type checking with enhanced compiler options
- **Import Sorting**: Automatic import organization via ESLint
- **Format on Save**: ESLint handles all formatting automatically

### Modern ESLint Configuration
Using ESLint v9 flat config (`eslint.config.js`) with:
- `typescript-eslint` v8 for TypeScript support
- Prettier integration via `eslint-plugin-prettier`
- Import sorting via `eslint-plugin-simple-import-sort`
- Unused import removal via `eslint-plugin-unused-imports`
- Type-aware linting with project references

### Unified Workflow
```bash
npm run check-all    # Type check + lint + format check + tests
npm run format       # Prettier format + ESLint fix + import sorting
npm run lint:fix     # ESLint auto-fix (includes Prettier + imports)
```

### Format on Save (VS Code)
- **ESLint as formatter**: Handles TypeScript/JavaScript files
- **Automatic import sorting**: Organizes imports on save
- **Prettier integration**: Formatting applied via ESLint
- **One-pass formatting**: All fixes applied simultaneously

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
- **TypeScript Integration**: Native support via `typescript-eslint` v8
- **Import Sorting**: Automatic import organization
- **Prettier Integration**: Formatting as ESLint rule
- **Format on Save**: ESLint handles all formatting

### Configuration Files
- `eslint.config.js` - ESLint v9 flat configuration with Prettier
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - TypeScript ESM configuration
- `.vscode/settings.json` - Format on save with ESLint

### Import Patterns
```typescript
// Imports are automatically sorted in this order:

// 1. External packages
import { nanoid } from 'nanoid';
import validator from 'validator';

// 2. Internal packages (with @shorting-urls alias)
import type { Url } from '@shorting-urls/domain/entities/Url';
import { UrlRepository } from '@shorting-urls/domain/repositories/UrlRepository';

// 3. Relative imports
import { createUrlService } from '../UrlServiceImpl';
import { setupTest } from './helpers';
```

### Functional Programming Standards
- **No Classes**: Use factory functions instead
- **No `let`**: Use `const` and immutable patterns
- **Arrow Functions**: All functions use arrow syntax
- **Pure Functions**: No side effects or mutations
- **Higher-Order Functions**: Functions returning configured functions

### TypeScript
- Use strict mode (enabled in `tsconfig.json`)
- Define interfaces for all data structures
- Use async/await over promises
- Prefer `const` over `let` (enforced by linting)

### Naming Conventions
- **Files**: PascalCase for types, camelCase for functions
- **Factory Functions**: `createServiceName` pattern
- **Interfaces**: PascalCase (e.g., `UrlRepository`)
- **Functions**: camelCase (e.g., `createShortUrl`)
- **Constants**: UPPER_SNAKE_CASE

### Import Patterns
```typescript
// Use path aliases with project name
import { Url } from '@shorting-urls/domain/entities/Url';
import { createUrlRepository } from '@shorting-urls/infrastructure/repositories/PrismaUrlRepository';

// Group imports: external, internal, relative
import express from 'express';
import { createUrlService } from '@shorting-urls/application/services/UrlServiceImpl';
import { createContainer } from './container';
```

## Testing Guidelines

### Testing Framework
- **Vitest**: Modern testing framework with ESM support
- **MockDeep**: Type-safe deep mocking for Prisma
- **Faker.js**: Realistic test data generation
- **Functional Testing**: Tests factory functions instead of classes

### Test Structure
```
src/
├── application/services/__tests__/
├── infrastructure/repositories/__tests__/
├── presentation/controllers/__tests__/
└── test/
    ├── fixtures/     # Dynamic test data with Faker.js
    └── mocks/        # Reusable mock utilities
```

### Unit Tests Structure
```typescript
// tests/unit/services/UrlService.test.ts
describe('UrlService', () => {
  const setupTest = () => {
    const mockRepository = createUrlRepositoryMock();
    const urlService = createUrlService(mockRepository, 'http://test.com');
    return { mockRepository, urlService };
  };
  
  describe('createShortUrl', () => {
    it('should create short URL with valid input', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl();
      
      // Test implementation with dynamic data
    });
  });
});
```

### Testing Commands
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Open Vitest UI
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
npm run build        # Build for production (ESM output)
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint (includes import sorting)
npm run lint:fix     # Fix ESLint + Prettier + imports automatically
npm run format       # Prettier + ESLint fix + import sorting
npm run format:check # Check formatting and linting
npm run type-check   # Run TypeScript type checking
npm run check-all    # Run type-check + lint + format + tests
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
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
2. Implement in service factory function
3. Add controller function
4. Add route in routing function
5. Update container if needed

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Update TypeScript interfaces
4. Update repository factory functions

### Adding Validation
```typescript
// Use validator library in service layer
import validator from 'validator';

const validateInput = (longUrl: string) => {
  if (!validator.isURL(longUrl)) {
    throw new Error('Invalid URL provided');
  }
};
```

## Deployment

### Docker Multi-Stage Build
The Dockerfile uses four optimized stages:

1. **base**: Shared foundation with package files and `.nvmrc`
2. **deps**: Production dependencies only
3. **builder**: Build stage with all dependencies
4. **runtime**: Final production image

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

This guide ensures consistent functional programming practices and helps maintain the clean architecture principles throughout the project lifecycle.
