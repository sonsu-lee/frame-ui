// WCAG 2.2 A/AA includes earlier revisions; axe has no wcag22a tag.
export const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// Storybook-owned elements only, matching addon-a11y's built-in exclusions.
export const previewExclusions = ['.sb-wrapper', '#storybook-docs', '#storybook-highlights-root'];
// Fixtures are document fragments. Page landmark ownership belongs to consumer apps.
export const disabledRules = ['region'];
