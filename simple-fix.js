#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Applying minimal TypeScript fixes...\n');

// Fix only the critical model JSON column issue
const modelsToFix = [
  'app/models/user.ts',
  'app/models/consultation.ts',
  'app/models/pregnancy.ts',
  'app/models/vaccination.ts',
  'app/models/vaccine_schedule.ts',
  'app/models/sync_log.ts',
  'app/models/tenant.ts',
  'app/models/vaccine_type.ts'
];

modelsToFix.forEach(modelPath => {
  const fullPath = path.join(__dirname, modelPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Fix only the consume function in JSON columns
    content = content.replace(
      /consume: \(value: string \| null\) => value \? JSON\.parse\(value\) : null/g,
      'consume: (value: string | null) => (value ? JSON.parse(value) : null) as any'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed ${path.basename(fullPath)}`);
    }
  }
});

console.log('\n✅ Basic model fixes applied. Try building now.');
