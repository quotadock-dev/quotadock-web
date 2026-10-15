import { test, expect } from '@playwright/test';
test.use({ locale: 'en-US' });
test('language preference synchronizes tabs and respects explicit versus system selection', async ({ page, context }) => {
  const requests: string[] = [];
  context.on('request', request => {
    expect(request.headers().authorization).toBeUndefined();
    requests.push(request.url());
  });
  await page.goto('/');
  const language = page.locator('header select');
  await expect(language).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('#scenario').selectOption('stale');
  await page.locator('#demo-refresh').click();
  await page.locator('#demo-refresh').click();
  const quotas = [72, 91, 84, 63, 88, 96];
  expect(await page.getByRole('progressbar').evaluateAll(elements => elements.map(element => (element as HTMLProgressElement).value))).toEqual(quotas);
  await expect(page.locator('.unknown')).toHaveCount(1);
  const second = await context.newPage();
  await second.goto('/');
  const secondLanguage = second.locator('header select');
  await expect(secondLanguage).toHaveValue('system');
  const requestCount = requests.length;
  const expectState = async (preference: string, resolved: string) => {
    await expect(language).toHaveValue(preference);
    await expect(page.locator('html')).toHaveAttribute('lang', resolved);
    await expect(page.locator('#scenario')).toHaveValue('stale');
    await expect(page.locator('#demo-status')).toContainText(resolved === 'ko' ? '예시 다시 보기 2회' : 'Replay sample: 2 (no network refresh)');
    expect(await page.getByRole('progressbar').evaluateAll(elements => elements.map(element => (element as HTMLProgressElement).value))).toEqual(quotas);
    await expect(page.locator('.unknown')).toHaveCount(1);
    expect(requests.length).toBe(requestCount);
  };
  // Real same-origin storage events originate in a different tab, not dispatchEvent.
  await secondLanguage.selectOption('ko');
  await expectState('ko', 'ko');
  await secondLanguage.selectOption('en');
  await expectState('en', 'en');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'ko-KR' });
    window.dispatchEvent(new Event('languagechange'));
  });
  await expectState('en', 'en');
  await language.selectOption('system');
  await expectState('system', 'ko');
  await secondLanguage.selectOption('en');
  await expectState('en', 'en');
  // Clearing site preferences must also restore the current system language.
  await second.evaluate(() => localStorage.clear());
  await expectState('system', 'ko');
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin && !/\/v[12]\//.test(url))).toBe(true);
  await second.close();
});
for (const width of [390, 1440]) test(`language preserves demo scenario and replay at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const requests: string[] = [];
  page.on('request', request => { expect(request.headers().authorization).toBeUndefined(); requests.push(request.url()); });
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const language = page.locator('header select');
  for (const scenario of ['normal', 'unknown', 'stale']) {
    await page.locator('#scenario').selectOption(scenario); await page.locator('#demo-refresh').click(); const count = requests.length;
    await language.focus(); await language.selectOption('ko'); await expect(language).toBeFocused();
    await expect(page.locator('.provider h3')).toHaveText(['Claude', 'Codex', 'Gemini', 'Grok']);
    await expect(page.locator('.plan').nth(1)).toHaveText('ChatGPT Pro · 예시');
    await expect(page.locator('.window-heading span').nth(4)).toHaveText('Pro 모델 티어');
    await expect(page.locator('#scenario')).toHaveValue(scenario); await expect(page.locator('#demo-status')).toContainText('예시 다시 보기 1회');
    if (process.env.CAPTURE_WEB && scenario === 'stale') await page.screenshot({ path: `.amp/in/artifacts/landing-ko-stale-${width}.png`, fullPage: true });
    await language.selectOption('en'); await expect(page.locator('#demo-status')).toContainText('Replay sample: 1 (no network refresh)');
    await expect(page.locator('.plan').nth(1)).toHaveText('ChatGPT Pro · Sample');
    await expect(page.locator('.window-heading span').nth(4)).toHaveText('Pro model tier');
    if (scenario !== 'unknown') await expect(page.getByRole('progressbar').nth(4)).toHaveAttribute('aria-label', 'Gemini Pro model tier Sample remaining quota');
    await expect(page.getByRole('progressbar')).toHaveCount(scenario === 'unknown' ? 0 : 6); expect(requests.length).toBe(count);
    const untranslated = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(element => element.tagName !== 'OPTION' && element.children.length === 0 && /[가-힣]/.test(element.textContent || '')).map(element => element.textContent));
    expect(untranslated).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/landing-en-stale-${width}.png`, fullPage: true });
  await language.selectOption('ko'); await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await language.selectOption('en'); await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await language.selectOption('system'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin && !/\/v[12]\//.test(url))).toBe(true);
});
test('narrow bilingual pages keep enlarged text and demo controls within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const language of ['en', 'ko']) for (const state of ['normal', 'unknown', 'stale']) {
    await page.goto('/');
    await page.locator('header select').selectOption(language);
    const scenario = page.locator('#scenario');
    await scenario.selectOption(state);
    // A text-only stress test, not browser zoom. Snapshot all computed sizes
    // before applying changes, so inherited fonts are doubled exactly once.
    await page.evaluate(() => {
      const original = [...document.querySelectorAll<HTMLElement>('body, body *')]
        .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
      for (const { element, size } of original) element.style.fontSize = `${size * 2}px`;
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${language}/${state}`).toBeLessThanOrEqual(320);
    await expect(page.getByRole('progressbar')).toHaveCount(state === 'unknown' ? 0 : 6);
    await expect(scenario).toBeVisible();
    await scenario.focus();
    await expect(scenario).toBeFocused();
    if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/landing-${language}-${state}-320-double-text.png`, fullPage: true });
    await page.locator('#demo-refresh').click();
    await expect(page.locator('#demo-status')).toContainText(language === 'ko' ? '예시 다시 보기 1회' : 'Replay sample: 1');
    await expect(scenario).toHaveValue(state);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
});
for (const mode of ['invalid', 'blocked']) test(`language fallback with ${mode} storage`, async ({ page }) => {
  await page.addInitScript(mode => {
    if (mode === 'blocked') for (const method of ['getItem', 'setItem']) Object.defineProperty(Storage.prototype, method, { value() { throw new Error('blocked'); } });
    else localStorage.setItem('quotadock.language', 'unsupported');
  }, mode);
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('header select').selectOption('ko'); await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await page.locator('#scenario').selectOption('unknown'); await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
test.describe('unsupported system locale', () => {
  test.use({ locale: 'fr-FR' });
  test('defaults to English', async ({ page }) => {
    await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('header select')).toHaveValue('system');
  });
});
