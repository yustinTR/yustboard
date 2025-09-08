const fs = require('fs');
const path = require('path');

// Mapping of old imports to new imports
const importMappings = {
  // Atoms
  '@/components/ui/button': '@/src/components/atoms/button',
  '@/components/ui/badge': '@/src/components/atoms/badge',
  '@/components/ui/label': '@/src/components/atoms/label',
  '@/components/ui/switch': '@/src/components/atoms/switch',
  '@/components/ui/progress': '@/src/components/atoms/progress',
  
  // Molecules
  '@/components/ui/card': '@/src/components/molecules/card',
  '@/components/ui/tabs': '@/src/components/molecules/tabs',
  
  // Organisms
  '@/components/dashboard/Header': '@/src/components/organisms/Header',
  '@/components/dashboard/Sidebar': '@/src/components/organisms/Sidebar',
  '@/components/dashboard/MobileSidebar': '@/src/components/organisms/MobileSidebar',
  '@/components/dashboard/UniversalSearch': '@/src/components/organisms/UniversalSearch',
  
  // Templates
  '@/components/ModernNavigation': '@/src/components/templates/ModernNavigation',
  '@/components/PublicNavigation': '@/src/components/templates/PublicNavigation',
  
  // Lib
  '@/lib/auth': '@/src/lib/auth/auth',
  '@/lib/auth-utils': '@/src/lib/auth/auth-utils',
  '@/lib/prisma': '@/src/lib/database/prisma',
  '@/lib/supabase': '@/src/lib/database/supabase',
  '@/lib/api-middleware': '@/src/lib/api/api-middleware',
  '@/lib/polling-manager': '@/src/lib/api/polling-manager',
  '@/lib/utils': '@/src/utils/helpers/utils',
  
  // Utils
  '@/utils/date-utils': '@/src/utils/date/date-utils',
  '@/utils/google-calendar': '@/src/utils/google/google-calendar',
  '@/utils/google-drive': '@/src/utils/google/google-drive',
  '@/utils/google-gmail': '@/src/utils/google/google-gmail',
  '@/utils/gmail-auth': '@/src/utils/google/gmail-auth',
  '@/utils/gmail-transactions': '@/src/utils/google/gmail-transactions',
  
  // Hooks
  '@/hooks/': '@/src/hooks/',
  
  // Contexts
  '@/contexts/': '@/src/contexts/',
  
  // Types
  '@/types/': '@/src/types/',
};

function updateImportsInFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldImport)) {
        content = content.replace(regex, newImport);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (stat.isFile()) {
      updateImportsInFile(filePath);
    }
  }
}

// Update imports in app directory
console.log('Updating imports in app directory...');
walkDirectory('./app');

// Update imports in src directory
console.log('Updating imports in src directory...');
walkDirectory('./src');

// Update imports in stories directory
if (fs.existsSync('./stories')) {
  console.log('Updating imports in stories directory...');
  walkDirectory('./stories');
}

console.log('Import update complete!');