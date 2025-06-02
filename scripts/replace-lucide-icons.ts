import { promises as fs } from 'fs';
import path from 'path';

// Mapping of lucide-react icons to react-icons
const iconMapping: Record<string, string> = {
  // Weather icons
  'Cloud': 'FiCloud',
  'CloudRain': 'FiCloudRain',
  'CloudSnow': 'FiCloudSnow',
  'Sun': 'FiSun',
  'RefreshCw': 'FiRefreshCw',
  'MapPin': 'FiMapPin',
  'Thermometer': 'FiThermometer',
  'Wind': 'FiWind',
  'Droplets': 'FiDroplet',
  
  // Fitness icons
  'Activity': 'FiActivity',
  'Footprints': 'FiActivity', // No direct equivalent, using Activity
  'Flame': 'FiZap', // Using Zap as alternative for Flame
  'Heart': 'FiHeart',
  'TrendingUp': 'FiTrendingUp',
  
  // Social icons
  'Users': 'FiUsers',
  
  // News icons
  'Newspaper': 'FiFileText',
  'ExternalLink': 'FiExternalLink',
  'Calendar': 'FiCalendar',
  
  // Settings icons
  'Shield': 'FiShield',
  'Eye': 'FiEye',
  'EyeOff': 'FiEyeOff',
  'Save': 'FiSave',
  'Bell': 'FiBell',
  'Palette': 'FiDroplet',
  'Globe': 'FiGlobe',
  'Menu': 'FiMenu',
  
  // Dashboard icons
  'Home': 'FiHome',
  'Trash2': 'FiTrash2',
  'Check': 'FiCheck',
  'X': 'FiX',
  'ChevronLeft': 'FiChevronLeft',
  'ChevronRight': 'FiChevronRight',
  'ChevronUp': 'FiChevronUp',
  'ChevronDown': 'FiChevronDown',
  'MoreVertical': 'FiMoreVertical',
  'Search': 'FiSearch',
  'Plus': 'FiPlus',
  'Edit2': 'FiEdit2',
  'Trash': 'FiTrash',
  'AlertCircle': 'FiAlertCircle',
};

async function replaceLucideIcons(filePath: string) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  // Check if file uses lucide-react
  if (!content.includes('lucide-react')) {
    return false;
  }
  
  console.log(`Processing ${path.basename(filePath)}...`);
  
  // Extract lucide imports
  const lucideImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
  if (!lucideImportMatch) {
    return false;
  }
  
  const lucideIcons = lucideImportMatch[1]
    .split(',')
    .map(icon => icon.trim())
    .filter(Boolean);
  
  // Map icons to react-icons
  const reactIcons: string[] = [];
  const unmappedIcons: string[] = [];
  
  for (const icon of lucideIcons) {
    if (iconMapping[icon]) {
      reactIcons.push(iconMapping[icon]);
      // Replace icon usage in the file
      const regex = new RegExp(`\\b${icon}\\b`, 'g');
      content = content.replace(regex, iconMapping[icon]);
      modified = true;
    } else {
      unmappedIcons.push(icon);
    }
  }
  
  if (unmappedIcons.length > 0) {
    console.log(`  ⚠️  Unmapped icons: ${unmappedIcons.join(', ')}`);
  }
  
  // Replace import statement
  if (reactIcons.length > 0) {
    const reactIconsImport = `import { ${reactIcons.join(', ')} } from 'react-icons/fi'`;
    content = content.replace(/import\s*{[^}]+}\s*from\s*['"]lucide-react['"]/, reactIconsImport);
    modified = true;
  }
  
  if (modified) {
    await fs.writeFile(filePath, content);
    console.log(`  ✅ Replaced ${lucideIcons.length} icons with react-icons`);
    return true;
  }
  
  return false;
}

async function main() {
  const files = [
    'app/dashboard/admin/page.tsx',
    'app/dashboard/news/page.tsx',
    'app/dashboard/page.tsx',
    'app/dashboard/settings/page.tsx',
    'components/dashboard/widgets/FitnessWidget.tsx',
    'components/dashboard/widgets/NewsWidget.tsx',
    'components/dashboard/widgets/SocialWidget.tsx',
    'components/dashboard/widgets/WeatherWidget.tsx',
  ];
  
  let totalReplaced = 0;
  
  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    try {
      const replaced = await replaceLucideIcons(filePath);
      if (replaced) totalReplaced++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n✅ Replaced lucide-react in ${totalReplaced} files`);
}

main().catch(console.error);