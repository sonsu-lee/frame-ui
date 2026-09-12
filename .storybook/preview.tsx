import type { Preview } from '@storybook/react-vite';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/600.css';
import '../src/styles.css';
import { disabledRules, wcagTags } from './a11y';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    viewport: {
      defaultViewport: 'chromium',
      options: {
        chromium: {
          name: 'Chromium',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
    options: {
      storySort: { order: ['Foundations', 'Components', 'Patterns', 'Customization'] },
    },
    a11y: {
      context: 'body',
      config: { rules: disabledRules.map((id) => ({ id, enabled: false })) },
      options: { runOnly: { type: 'tag', values: wcagTags } },
      test: 'error',
    },
  },
};

export default preview;
