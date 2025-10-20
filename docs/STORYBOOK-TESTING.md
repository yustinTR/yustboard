# Storybook Testing Guide

This guide explains how to use Storybook for visual, interaction, and accessibility testing.

## Overview

Storybook provides three types of testing:
1. **Visual Testing** - See components in different states
2. **Interaction Testing** - Test user interactions automatically
3. **Accessibility Testing** - Check WCAG compliance with axe-core

## Accessibility Testing (A11y)

### Setup

The `@storybook/addon-a11y` addon is configured in `.storybook/main.ts` and automatically runs axe-core on all stories.

### Viewing Accessibility Results

1. Start Storybook: `npm run storybook`
2. Open any story
3. Click the **Accessibility** tab in the addon panel
4. View violations, passes, and incomplete checks

### Example Story with A11y

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  // Global a11y configuration for this component
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Customize which rules to run
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

// Disable a11y for specific story
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
  parameters: {
    a11y: {
      disable: true, // Disable if component has known issues being fixed
    },
  },
};
```

### Common A11y Issues and Fixes

**Issue: Missing aria-label**
```tsx
// ❌ Bad
<button><Icon name="close" /></button>

// ✅ Good
<button aria-label="Close"><Icon name="close" /></button>
```

**Issue: Low color contrast**
```tsx
// ❌ Bad
<button className="text-gray-300 bg-gray-100">Click</button>

// ✅ Good
<button className="text-gray-900 bg-white">Click</button>
```

**Issue: Missing alt text**
```tsx
// ❌ Bad
<img src="/logo.png" />

// ✅ Good
<img src="/logo.png" alt="Company Logo" />
```

## Interaction Testing

### Setup

The `@storybook/addon-interactions` addon is already configured. It uses `@storybook/test` (similar to Testing Library).

### Writing Interaction Tests

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Forms/LoginForm',
  component: LoginForm,
};

export default meta;
type Story = StoryObj<typeof meta>;

// Test user interactions
export const FillAndSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find form elements
    const emailInput = canvas.getByLabelText('Email');
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: /submit/i });

    // Simulate user actions
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Assert expected behavior
    await expect(canvas.getByText('Welcome back!')).toBeInTheDocument();
  },
};

// Test validation
export const ShowsValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Should show validation errors
    await expect(canvas.getByText('Email is required')).toBeInTheDocument();
    await expect(canvas.getByText('Password is required')).toBeInTheDocument();
  },
};

// Test keyboard navigation
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByLabelText('Email');

    // Focus first input
    emailInput.focus();
    expect(emailInput).toHaveFocus();

    // Tab to next input
    await userEvent.tab();
    const passwordInput = canvas.getByLabelText('Password');
    expect(passwordInput).toHaveFocus();

    // Tab to submit button
    await userEvent.tab();
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    expect(submitButton).toHaveFocus();
  },
};
```

### Running Interaction Tests

```bash
# Start Storybook
npm run storybook

# Run tests in CLI
npm run test-storybook

# Run tests in CI
npm run build-storybook && npm run test-storybook
```

### Available Interactions

From `@storybook/test`:

```typescript
import { within, userEvent, expect } from '@storybook/test';

// User interactions
await userEvent.click(element);
await userEvent.dblClick(element);
await userEvent.type(input, 'text');
await userEvent.clear(input);
await userEvent.selectOptions(select, 'option');
await userEvent.tab();
await userEvent.keyboard('{Enter}');
await userEvent.hover(element);
await userEvent.unhover(element);
await userEvent.paste('text');

// Queries (from Testing Library)
canvas.getByRole('button', { name: /submit/i });
canvas.getByLabelText('Email');
canvas.getByText('Welcome');
canvas.getByPlaceholderText('Search...');
canvas.getByTestId('submit-button');
canvas.queryByText('Optional'); // Returns null if not found
await canvas.findByText('Async content'); // Waits for element

// Assertions
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveFocus();
expect(element).toHaveAttribute('aria-label', 'Close');
expect(element).toHaveClass('active');
```

## Visual Testing

### Chromatic (Optional)

For automated visual regression testing, you can use [Chromatic](https://www.chromatic.com/):

1. Sign up at chromatic.com
2. Install: `npm install -D chromatic`
3. Run: `npx chromatic --project-token=<your-token>`

### Manual Visual Testing

1. Start Storybook: `npm run storybook`
2. View each story in different viewports:
   - Mobile: 320px, 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px, 1920px
3. Test dark/light modes (if applicable)
4. Test different states:
   - Default
   - Hover
   - Focus
   - Active
   - Disabled
   - Loading
   - Error

### Example with Multiple States

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  // Test in different viewports
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Different states
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Hover: Story = {
  args: {
    children: 'Hover me',
  },
  parameters: {
    pseudo: { hover: true },
  },
};

export const Focused: Story = {
  args: {
    children: 'Focused',
  },
  parameters: {
    pseudo: { focus: true },
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
  },
};

// Mobile viewport
export const Mobile: Story = {
  args: {
    children: 'Mobile Button',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

## Best Practices

### Accessibility

1. **Test every component** - Add stories for all UI components
2. **Test all states** - Default, hover, focus, disabled, error, loading
3. **Fix all violations** - Don't ignore a11y warnings
4. **Use semantic HTML** - Proper HTML elements are automatically accessible
5. **Test keyboard navigation** - Ensure all interactive elements are keyboard accessible

### Interactions

1. **Test user flows** - Common paths users take through your UI
2. **Test edge cases** - Empty states, long text, validation errors
3. **Keep tests focused** - One interaction per story when possible
4. **Use realistic data** - Test with real-world scenarios
5. **Test keyboard and mouse** - Both interaction methods should work

### Visual

1. **Document variants** - Show all visual variants of components
2. **Test responsive design** - Check mobile, tablet, desktop viewports
3. **Test themes** - If you support multiple themes
4. **Add descriptions** - Use JSDoc comments to explain component usage
5. **Group related stories** - Use title hierarchy (e.g., 'Forms/Input/Text')

## Running Tests in CI

Tests run automatically in `.github/workflows/test-all.yml`:

```yaml
storybook:
  name: Storybook Tests
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Build Storybook
      run: npm run build-storybook

    - name: Install Playwright
      run: npx playwright install --with-deps chromium

    - name: Run Storybook tests
      run: |
        npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
          "npx http-server storybook-static --port 6006 --silent" \
          "npx wait-on tcp:6006 && npm run test-storybook"
```

## Debugging

### View Tests in Browser

```bash
npm run storybook
# Click "Play" button in the story to run interactions
# View results in "Interactions" tab
```

### Debug Failed Tests

```bash
# Run tests with more details
npm run test-storybook -- --verbose

# Run specific story
npm run test-storybook -- --story-match="LoginForm/FillAndSubmit"

# Debug mode
npm run test-storybook -- --debug
```

### Common Issues

**Issue: "Element not found"**
```typescript
// ❌ Bad - Element might not be ready
const button = canvas.getByRole('button');

// ✅ Good - Wait for async rendering
const button = await canvas.findByRole('button');
```

**Issue: "Element not visible"**
```typescript
// Check if element is actually visible
await expect(element).toBeVisible();
await expect(element).not.toBeDisabled();
```

**Issue: "Can't click element"**
```typescript
// Ensure element is interactive
await userEvent.click(button);
// vs
button.click(); // Might fail if element is covered
```

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Addon A11y](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Addon Interactions](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Testing Library](https://testing-library.com/docs/queries/about)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chromatic](https://www.chromatic.com/docs)

## Next Steps

1. Add stories for all components that don't have them
2. Add interaction tests for critical user flows
3. Review and fix all accessibility violations
4. Consider setting up Chromatic for visual regression testing
5. Document component usage in story descriptions
