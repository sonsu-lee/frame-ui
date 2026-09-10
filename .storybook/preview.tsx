import type { Preview } from '@storybook/react-vite';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/600.css';
import '../src/styles.css';
import { disabledRules, wcagTags } from './a11y';

const preview: Preview = {
  tags: ['autodocs'],
  // Canonical static tests own body axe scans. Avoid racing addon afterEach with AxeBuilder.
  // Development, ordinary builds and Vitest retain automatic addon checks.
  initialGlobals: { a11y: { manual: import.meta.env.VITE_FRAME_UI_A11Y_OWNER === 'playwright' } },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: { storySort: { order: ['Foundations', 'Components', 'Patterns', 'Customization'] } },
    a11y: {
      context: 'body',
      config: { rules: disabledRules.map((id) => ({ id, enabled: false })) },
      options: { runOnly: { type: 'tag', values: wcagTags } },
      test: 'error',
    },
  },
};
export default preview;
