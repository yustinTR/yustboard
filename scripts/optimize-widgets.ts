import { promises as fs } from 'fs';
import path from 'path';

async function optimizeWidget(filePath: string) {
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Skip if already memoized
  if (content.includes('React.memo')) {
    console.log(`✓ ${path.basename(filePath)} already optimized`);
    return;
  }
  
  // Add React import if not present
  if (!content.includes('import React')) {
    if (content.includes("from 'react'")) {
      content = content.replace(
        /import \{([^}]+)\} from 'react'/,
        "import React, {$1} from 'react'"
      );
    } else {
      content = content.replace(
        "'use client'",
        "'use client'\n\nimport React from 'react'"
      );
    }
  }
  
  // Find the component name
  const componentMatch = content.match(/export default function (\w+)\(/);
  if (!componentMatch) {
    console.log(`⚠ ${path.basename(filePath)} - couldn't find component`);
    return;
  }
  
  const componentName = componentMatch[1];
  
  // Replace export default function with memoized version
  content = content.replace(
    /export default function (\w+)\(/,
    `const $1 = React.memo(function $1(`
  );
  
  // Add export at the end
  const lastBracketIndex = content.lastIndexOf('}');
  content = content.slice(0, lastBracketIndex + 1) + 
    ');\n\nexport default ' + componentName + ';' +
    content.slice(lastBracketIndex + 1);
  
  await fs.writeFile(filePath, content);
  console.log(`✅ ${path.basename(filePath)} optimized with React.memo`);
}

async function main() {
  const widgetsDir = path.join(process.cwd(), 'components/dashboard/widgets');
  const files = await fs.readdir(widgetsDir);
  
  for (const file of files) {
    if (file.endsWith('.tsx') && (file.includes('Widget') || file.includes('List') || file.includes('Viewer'))) {
      await optimizeWidget(path.join(widgetsDir, file));
    }
  }
}

main().catch(console.error);