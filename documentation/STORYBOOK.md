# Storybook & Chromatic Documentation

This project is configured with Storybook 9 for component development and Chromatic for visual regression testing.

## 🎉 Complete Setup

✅ **Storybook 9** - Installed and configured for Next.js with TypeScript  
✅ **Chromatic** - Configured with project token `chpt_1e600286588360b`  
✅ **Stories Created** - All components now have comprehensive stories  
✅ **GitHub Actions** - Automated testing workflows configured  
✅ **Tailwind CSS** - Fully integrated with proper theming  

## Getting Started

### Running Storybook Locally

```bash
npm run storybook
```

This will start Storybook on http://localhost:6006

### Building Storybook

```bash
npm run build-storybook
```

### Running Chromatic

```bash
npm run chromatic
```

## 📚 Available Stories

### UI Components
- **Badge** - All variants (default, secondary, destructive, outline)
- **Button** - All variants and sizes with interactions
- **Card** - Multiple layouts and examples
- **Label** - Form integration examples
- **Progress** - Animated and static examples
- **Switch** - Settings page examples
- **Tabs** - Complex form examples

### Dashboard Components
- **Header** - Different user roles and states
- **Sidebar** - Collapsed/expanded states, custom menus
- **UniversalSearch** - Search states and results

### Dashboard Widgets
- **WeatherWidget** - Loading, error, and success states
- **TaskWidget** - Calendar integration examples
- **GmailWidget** - Email list with various states
- **NewsWidget** - Article feeds with different categories

### Timeline Components
- **Post** - Various post types and user states

## GitHub Actions

The project includes two GitHub Actions workflows:

1. **Chromatic** (`.github/workflows/chromatic.yml`): Runs on every push and PR to main/develop branches
2. **Storybook Tests** (`.github/workflows/storybook-tests.yml`): Runs Storybook tests

### Setting up GitHub Secrets

Add your Chromatic project token as a GitHub secret:

1. Go to your repository settings
2. Navigate to Secrets and variables > Actions
3. Add a new secret named `CHROMATIC_PROJECT_TOKEN` with value: `chpt_1e600286588360b`

## Writing New Stories

Stories are written in TypeScript and should be placed next to their components with the `.stories.tsx` extension.

Example story structure:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define your component props here
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Component Categories

- **UI**: Basic UI components (buttons, cards, badges, etc.)
- **Dashboard**: Main dashboard components (header, sidebar, search)
- **Dashboard/Widgets**: Dashboard-specific widgets (weather, tasks, etc.)
- **Dashboard/Timeline**: Social timeline components

## Visual Testing with Chromatic

Chromatic will automatically:
- Capture snapshots of all stories
- Compare them with the baseline
- Flag any visual changes
- Auto-accept changes on the main branch
- Only test changed components to save on snapshots

## 🚀 Next Steps

1. **View your stories**: Visit http://localhost:6006 after running `npm run storybook`
2. **Add GitHub secret**: Add `CHROMATIC_PROJECT_TOKEN` to your repository
3. **First Chromatic build**: Run `npm run chromatic` to establish baseline
4. **Customize stories**: Modify existing stories or create new ones as needed

Your Storybook is now fully set up with comprehensive component documentation and visual regression testing!