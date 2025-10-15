#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const prettierCmd = 'prettier --write "src/**/*.{ts,js,json}"';
const eslintCmd = 'eslint src --ext .ts,.js,.json --fix';

try {
  console.log('🎨 Formatting with Prettier...');
  execSync(prettierCmd, { stdio: 'inherit' });
  
  console.log('🔍 Running ESLint...');
  execSync(eslintCmd, { stdio: 'inherit' });
  
  console.log('✅ Code formatting complete!');
} catch (error) {
  console.error('❌ Formatting failed:', error.message);
  process.exit(1);
}
