# YustBoard Development Guidelines

This document contains important development guidelines and standards for the YustBoard project that should be followed by all contributors, including AI assistants.

## 🚀 Pre-Commit Requirements

### Build Verification
**CRITICAL**: Before any commit, always run and ensure these commands pass without errors:

```bash
npm run build
```

- The build must complete successfully with zero errors
- Type checking must pass without issues
- All imports and dependencies must be resolved
- No unused variables or dead code should remain

### Linting and Type Checking
Run these commands to ensure code quality:

```bash
npm run lint
npm run typecheck
```

If these commands are not available, ask the user for the correct commands and update this file.

## 📚 Storybook Requirements

### Component Stories
**MANDATORY**: Every new component must have a corresponding Storybook story.

#### Story Structure
```typescript
// components/ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define component props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Variant: Story = {
  args: {
    // Variant props
  },
};
```

#### Story Categories
- **UI Components**: `Components/UI/ComponentName`
- **Dashboard Widgets**: `Dashboard/Widgets/WidgetName`
- **Layout Components**: `Layout/ComponentName`
- **Page Components**: `Pages/PageName`

### Story Testing
- All stories must be browser-compatible (no Node.js specific code)
- Mock external dependencies (APIs, browser APIs)
- Use proper TypeScript types
- Include multiple variants when applicable

## 🎨 Design System Standards

### Glass Morphism Design
All dashboard components should follow the glass morphism design pattern:

```typescript
// Widget container
className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden"

// Widget header with gradient
className="p-4 bg-gradient-to-r from-[color]-500/80 to-[color]-600/80 backdrop-blur-sm text-white border-b border-white/20 dark:border-gray-700/30"

// Widget content
className="p-4 bg-white/5 backdrop-blur-sm"

// Widget footer
className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center"
```

### Color Schemes by Widget Type
- **Timeline**: Indigo gradient (`from-indigo-500/80 to-indigo-600/80`)
- **Gmail**: Red gradient (`from-red-500/80 to-red-600/80`)
- **Calendar/Tasks**: Green gradient (`from-green-500/80 to-green-600/80`)
- **News**: Purple gradient (`from-purple-500/80 to-purple-600/80`)
- **Weather**: Blue gradient (`from-blue-500/80 to-blue-600/80`)
- **Banking**: Green gradient (`from-green-500/80 to-green-600/80`)
- **Blog**: Indigo gradient (`from-indigo-500/80 to-indigo-600/80`)
- **Social**: Purple gradient (`from-purple-500/80 to-purple-600/80`)
- **Fitness**: Orange gradient (`from-orange-500/80 to-orange-600/80`)
- **Files**: Blue gradient (`from-blue-500/80 to-blue-600/80`)

### Interactive Elements
```typescript
// Buttons and links
className="hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"

// Form inputs
className="bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-[color]-500/50"
```

## ⚛️ Next.js Standards

### File Structure
```
app/
├── (auth)/
│   └── login/
├── api/
│   └── route.ts
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
└── layout.tsx

components/
├── ui/
├── dashboard/
│   └── widgets/
└── providers/
```

### Component Conventions
- Use `'use client'` directive for client components
- Use `React.memo()` for performance optimization on widgets
- Export components as default when single export
- Use proper TypeScript interfaces for props

### API Routes
```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### Error Handling
- Always implement proper error boundaries
- Use try-catch blocks in API routes
- Return meaningful error messages
- Log errors for debugging

### Performance
- Use `dynamic()` for code splitting large components
- Implement loading states for async operations
- Use `useCallback()` and `useMemo()` appropriately
- Optimize images with Next.js Image component

## 🔧 Code Quality Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Avoid `any` type unless absolutely necessary
- Use proper generic types

### Imports
```typescript
// External libraries first
import React from 'react';
import { useSession } from 'next-auth/react';

// Internal components
import { Button } from '@/components/ui/button';
import { Widget } from '@/components/dashboard/Widget';

// Utils and types
import { formatDate } from '@/utils/date-utils';
import type { User } from '@/types/auth';
```

### Naming Conventions
- Components: PascalCase (`UserProfile`)
- Files: kebab-case (`user-profile.tsx`)
- Variables/Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🎯 Development Workflow

### Before Starting Work
1. Check current todos with TodoRead tool
2. Plan tasks with TodoWrite tool
3. Understand existing codebase patterns

### During Development
1. Follow glass morphism design patterns
2. Create Storybook stories for new components
3. Test components in isolation
4. Ensure responsive design

### Before Committing
1. ✅ Run `npm run build` - must pass
2. ✅ Run `npm run lint` - must pass  
3. ✅ Run `npm run typecheck` - must pass
4. ✅ Create/update Storybook stories
5. ✅ Test in browser (development mode)
6. ✅ Check responsive design on mobile

### Commit Message Format
```
type: brief description

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 Testing Guidelines

### Storybook Testing
- All components must have stories
- Stories should cover main use cases
- Mock external dependencies properly
- Ensure stories work in both light/dark modes

### Browser Compatibility
- Test in Chrome, Firefox, Safari
- Ensure mobile responsiveness
- Check touch interactions on mobile devices

## 📝 Documentation

### Component Documentation
- Document props with TypeScript interfaces
- Include usage examples in stories
- Document any special setup requirements

### API Documentation
- Document API endpoints and their parameters
- Include example requests and responses
- Document error responses

## 🔍 Common Patterns

### Widget Structure
```typescript
const WidgetName = React.memo(function WidgetName() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Glass morphism container
  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-[color]-500/80 to-[color]-600/80 backdrop-blur-sm text-white">
        {/* Header content */}
      </div>
      
      {/* Content */}
      <div className="p-4 bg-white/5 backdrop-blur-sm">
        {/* Widget content */}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-white/5 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30">
        {/* Footer content */}
      </div>
    </div>
  );
});
```

### Modal Structure
```typescript
// Use createPortal for modals
return createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]">
    <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-white/20 dark:border-gray-700/30">
      {/* Modal content */}
    </div>
  </div>,
  document.body
);
```

---

Remember: **Quality over speed**. Always ensure the build passes and components have stories before committing!