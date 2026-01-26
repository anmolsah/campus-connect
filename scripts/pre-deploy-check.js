#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Run this before deploying to catch common issues
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Running pre-deployment checks...\n');

let hasErrors = false;

// Check 1: Environment variables
console.log('1️⃣  Checking environment variables...');
const envPath = join(rootDir, '.env');
if (!existsSync(envPath)) {
    console.log('   ❌ .env file not found');
    hasErrors = true;
} else {
    const envContent = readFileSync(envPath, 'utf-8');
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

    requiredVars.forEach(varName => {
        if (!envContent.includes(varName)) {
            console.log(`   ❌ Missing ${varName}`);
            hasErrors = true;
        }
    });

    if (!hasErrors) {
        console.log('   ✅ Environment variables look good');
    }
}

// Check 2: Dependencies
console.log('\n2️⃣  Checking dependencies...');
try {
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
    const nodeModulesExists = existsSync(join(rootDir, 'node_modules'));

    if (!nodeModulesExists) {
        console.log('   ❌ node_modules not found. Run: npm install');
        hasErrors = true;
    } else {
        console.log('   ✅ Dependencies installed');
    }
} catch (error) {
    console.log('   ❌ Error reading package.json');
    hasErrors = true;
}

// Check 3: TypeScript
console.log('\n3️⃣  Running TypeScript check...');
try {
    execSync('npm run typecheck', { stdio: 'pipe', cwd: rootDir });
    console.log('   ✅ No TypeScript errors');
} catch (error) {
    console.log('   ❌ TypeScript errors found. Run: npm run typecheck');
    hasErrors = true;
}

// Check 4: Build
console.log('\n4️⃣  Testing build...');
try {
    execSync('npm run build', { stdio: 'pipe', cwd: rootDir });
    console.log('   ✅ Build successful');

    // Check if dist folder was created
    if (existsSync(join(rootDir, 'dist'))) {
        console.log('   ✅ dist folder created');
    } else {
        console.log('   ❌ dist folder not found');
        hasErrors = true;
    }
} catch (error) {
    console.log('   ❌ Build failed. Run: npm run build');
    hasErrors = true;
}

// Check 5: Required files
console.log('\n5️⃣  Checking required files...');
const requiredFiles = [
    'public/_redirects',
    'vite.config.ts',
    'package.json',
    'tsconfig.json',
];

requiredFiles.forEach(file => {
    if (existsSync(join(rootDir, file))) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        hasErrors = true;
    }
});

// Check 6: Git status
console.log('\n6️⃣  Checking Git status...');
try {
    const gitStatus = execSync('git status --porcelain', {
        encoding: 'utf-8',
        cwd: rootDir
    });

    if (gitStatus.trim()) {
        console.log('   ⚠️  Uncommitted changes found');
        console.log('   💡 Commit your changes before deploying');
    } else {
        console.log('   ✅ All changes committed');
    }
} catch (error) {
    console.log('   ⚠️  Not a git repository or git not installed');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Pre-deployment checks FAILED');
    console.log('Please fix the errors above before deploying.');
    process.exit(1);
} else {
    console.log('✅ All checks passed!');
    console.log('🚀 Ready to deploy to Cloudflare Pages');
    console.log('\nNext steps:');
    console.log('1. Push to GitHub: git push origin main');
    console.log('2. Deploy via Cloudflare Pages dashboard');
    console.log('3. Or use: wrangler pages deploy dist');
}
console.log('='.repeat(50) + '\n');
