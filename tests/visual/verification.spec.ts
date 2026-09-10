import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { disabledRules, previewExclusions, wcagTags } from '../../.storybook/a11y';

const test = base.extend<{ evidence: void }>({
  evidence: [async ({ page, browser }, use, testInfo) => {
    const logs: string[] = [];
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) logs.push(`console ${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => logs.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
    page.on('response', (response) => { if (response.status() >= 400) logs.push(`HTTP ${response.status()}: ${response.url()}`); });
    await use();
    await testInfo.attach('browser-log', { body: JSON.stringify(logs, null, 2), contentType: 'application/json' });
    await testInfo.attach('environment', { body: JSON.stringify({
      commit: process.env.FRAME_UI_COMMIT, dirty: process.env.FRAME_UI_DIRTY,
      node: process.version, platform: process.platform, arch: process.arch, browser: browser.version(),
      image: process.env.FRAME_UI_IMAGE, font: '@fontsource/noto-sans-kr@5.3.0 (400/600)',
      viewport: testInfo.project.use.viewport, dpr: 1, locale: 'ko-KR', timezone: 'Asia/Tokyo', reducedMotion: 'reduce',
    }, null, 2), contentType: 'application/json' });
    expect(logs, 'No unexplained browser warnings, errors or failed resources').toEqual([]);
  }, { auto: true }],
});

async function openStory(page: Page, story: string) {
  await page.goto(`/iframe.html?id=components-internal-verification--${story}&viewMode=story`);
  await expect(page.getByTestId('verification-fixture')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (!document.fonts.check('400 16px "Noto Sans KR"', '브라우저') || !document.fonts.check('600 16px "Noto Sans KR"', '브라우저')) {
      throw new Error('Fixture fonts did not load');
    }
  });
  await expect(page.getByTestId('verification-fixture')).toHaveCSS('border-radius', '12px');
  await expect(page.getByTestId('verification-fixture')).toHaveCSS('border-top-width', '1px');
  await expect(page.getByTestId('verification-fixture')).toHaveCSS('font-family', '"Noto Sans KR", sans-serif');
}
async function axe(page: Page, info: TestInfo, state: string) {
  let builder = new AxeBuilder({ page }).include('body').withTags(wcagTags).disableRules(disabledRules);
  for (const selector of previewExclusions) builder = builder.exclude(selector);
  const results = await builder.analyze();
  await info.attach(`axe-${state}`, { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
  expect(results.violations, `body axe: ${state}`).toEqual([]);
}

test('error-transition', async ({ page }, info) => {
  await openStory(page, 'default');
  await expect(page.getByRole('textbox')).toHaveValue('');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('portal')).toHaveCount(0);
  await axe(page, info, 'default');
  await expect(page).toHaveScreenshot('error-before.png', { fullPage: true });
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('alert')).toHaveText('이름을 입력해 주세요.');
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await axe(page, info, 'error');
  await expect(page).toHaveScreenshot('error-after.png', { fullPage: true });
});

test('portal-transition', async ({ page }, info) => {
  await openStory(page, 'default');
  const trigger = page.getByRole('button', { name: '도움말 열기' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('portal')).toHaveCount(0);
  await expect(page).toHaveScreenshot('portal-before.png', { fullPage: true });
  await trigger.click();
  await expect(page.getByTestId('portal')).toBeVisible();
  await expect(page.getByRole('button', { name: '도움말 닫기' })).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await axe(page, info, 'portal-open');
  await expect(page).toHaveScreenshot('portal-after.png', { fullPage: true });
  await page.getByRole('button', { name: '도움말 닫기' }).click();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('portal')).toHaveCount(0);
});

test('long-text', async ({ page }, info) => {
  await openStory(page, 'long-text');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await axe(page, info, 'long-text');
  await expect(page).toHaveScreenshot('long-text.png', { fullPage: true });
});

test('keyboard-focus', async ({ page }) => {
  await openStory(page, 'default');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: '이름' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '저장' })).toBeFocused();
  await page.keyboard.press('Tab');
  const trigger = page.getByRole('button', { name: '도움말 열기' });
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-width', '3px');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '도움말 닫기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('portal')).toHaveCount(0);
});
