import { test, expect } from '@playwright/test';
test.use({ locale: 'en-US' });
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
test('sample provider display data is not a translation label', async ({ page }) => {
  // Substitute one sample plan at the asset boundary; no test-only production API.
  const plan = 'ChatGPT Pro · 사용량 · 알 수 없음';
  await page.route('**/assets/*.js', async route => {
    const response = await route.fetch();
    const body = await response.text();
    expect(body).toContain('"ChatGPT Pro"');
    await route.fulfill({ response, body: body.replace('"ChatGPT Pro"', JSON.stringify(plan)) });
  });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await page.locator('#demo-refresh').click();
  const count = requests.length;
  for (const language of ['ko', 'en', 'ko', 'en']) {
    await page.locator('header select').selectOption(language);
    await expect(page.locator('.plan').nth(1)).toHaveText(`${plan} · ${language === 'ko' ? '예시' : 'Sample'}`);
    await expect(page.locator('#demo-status')).toContainText(language === 'ko' ? '예시 다시 보기 1회' : 'Replay sample: 1');
    expect(requests.length).toBe(count);
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
