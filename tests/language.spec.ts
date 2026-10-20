import { test, expect } from '@playwright/test';
test.use({ locale: 'en-US' });
test('blocked localStorage getter leaves language usable even on storage events', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
  await page.goto('/');
  await page.locator('header select').selectOption('ko');
  await expect(page.locator('#language-save-status')).toHaveAttribute('role', 'status');
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'quotadock.language', newValue: 'en' })));
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  expect(errors).toEqual([]);
});
for (const [languages, expected] of [
  [['fr-FR', 'ko-KR', 'en-US'], 'ko'],
  [['fr-FR', 'en-US', 'ko-KR'], 'en'],
  [['fr-FR', 'de-DE'], 'en'],
  [[], 'ko'],
] as const) test(`first supported system language: ${languages.join(',') || 'navigator.language fallback'}`, async ({ page }) => {
  await page.addInitScript(languages => {
    Object.defineProperty(navigator, 'languages', { configurable: true, value: languages });
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'ko-KR' });
  }, languages);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', expected);
  const language = page.locator('header select');
  await language.selectOption('en');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'languages', { configurable: true, value: ['fr-FR', 'ko-KR', 'en-US'] });
    window.dispatchEvent(new Event('languagechange'));
  });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(language).toHaveValue('en');
  await language.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('lang', expected);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'languages', { configurable: true, value: ['fr-FR', 'ko-KR', 'en-US'] });
    window.dispatchEvent(new Event('languagechange'));
  });
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});
test('iframe session storage cannot change the language preference', async ({ page, context }) => {
  await page.goto('/');
  const language = page.locator('header select');
  await language.selectOption('en');
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.src = 'about:blank';
    document.body.append(frame);
  });
  for (const clear of [false, true]) {
    const event = page.evaluate(() => new Promise(resolve => window.addEventListener('storage', event => resolve({ key: event.key, session: event.storageArea === sessionStorage }), { once: true })));
    await page.frames()[1].evaluate(clear => {
      if (clear) sessionStorage.clear();
      else sessionStorage.setItem('quotadock.language', 'ko');
    }, clear);
    expect(await event).toEqual({ key: clear ? null : 'quotadock.language', session: true });
    await expect(language).toHaveValue('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  }
  const second = await context.newPage();
  await second.goto('/');
  await second.locator('header select').selectOption('ko');
  await expect(language).toHaveValue('ko');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await second.close();
});
test('failed language saves explain temporary choice and recover on a successful save', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    const save = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'quotadock.language' && value !== 'system') throw new DOMException('Storage unavailable', 'QuotaExceededError');
      save.call(this, key, value);
    };
  });
  const language = page.locator('header select');
  const feedback = page.locator('#language-save-status');
  await expect(feedback).toBeHidden();
  await page.locator('#scenario').selectOption('stale');
  await page.locator('#demo-refresh').click();
  const quotas = await page.getByRole('progressbar').evaluateAll(elements => elements.map(element => (element as HTMLProgressElement).value));
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  for (const choice of ['ko', 'en']) {
    await language.focus();
    await language.selectOption(choice);
    await expect(language).toBeFocused();
    await expect(feedback).toHaveAttribute('role', 'status');
    await expect(language).toHaveAttribute('aria-describedby', 'language-save-status');
    await expect(feedback).toHaveText(choice === 'ko' ? '언어 설정을 저장하지 못했습니다. 새로고침하면 선택이 유지되지 않을 수 있습니다.' : 'Could not save your language. Your choice may reset on reload.');
    await expect(page.locator('#scenario')).toHaveValue('stale');
    await expect(page.locator('#demo-status')).toContainText(choice === 'ko' ? '예시 다시 보기 1회' : 'Replay sample: 1');
    expect(await page.getByRole('progressbar').evaluateAll(elements => elements.map(element => (element as HTMLProgressElement).value))).toEqual(quotas);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/language-save-failure-${choice}-320.png`, fullPage: true });
  }
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll<HTMLElement>('body, body *')].map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of sizes) element.style.fontSize = `${size * 2}px`;
  });
  for (const choice of ['ko', 'en']) {
    await language.selectOption(choice);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/language-save-failure-${choice}-320-double-text.png`, fullPage: true });
  }
  expect(requests).toEqual([]);
  await language.selectOption('system');
  await expect(feedback).toBeEmpty();
  await page.reload();
  await expect(language).toHaveValue('system');
  await expect(feedback).toBeEmpty();
});
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
    Object.defineProperty(navigator, 'languages', { configurable: true, value: ['ko-KR', 'en-US'] });
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
for (const width of [320, 390, 1440]) test(`language preserves demo scenario and replay at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const requests: string[] = [];
  page.on('request', request => { expect(request.headers().authorization).toBeUndefined(); requests.push(request.url()); });
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const language = page.locator('header select');
  for (const choice of ['ko', 'en']) {
    await language.selectOption(choice);
    await expect(page.locator('body')).not.toContainText(/출시|목표|준비중|베타|개발 중|planned|pre-release|beta|development|month target/i);
    await expect(page.locator('#plans h3')).toHaveText(['QuotaDock Free', 'QuotaDock Plus', 'QuotaDock Pro']);
    for (const cycle of ['month', 'year']) {
      await page.getByRole('combobox', { name: choice === 'ko' ? '결제 주기' : 'Billing cycle' }).selectOption(cycle);
      await expect(page.locator('#plans .price').nth(1)).toContainText(cycle === 'month' ? '2,990' : '29,900');
      await expect(page.locator('#plans .price').nth(2)).toContainText(cycle === 'month' ? '5,990' : '59,900');
      await expect(page.getByRole('article', { name: 'Pro', exact: true })).toContainText(choice === 'ko' ? 'AI 계정 최대 25개' : 'Up to 25 AI accounts');
      await expect(page.locator('.trial-details')).toHaveCount(0);
      for (const [name, amount] of [['Plus', cycle === 'month' ? '2,990' : '29,900'], ['Pro', cycle === 'month' ? '5,990' : '59,900']]) {
        const payment = page.getByRole('article', { name, exact: true }).locator('p').filter({ hasText: choice === 'ko' ? '첫 구매 시 결제:' : 'Charged at first purchase:' });
        await expect(payment).toContainText(amount);
        await expect(payment).toContainText(choice === 'ko' ? '자동 갱신' : 'auto-renewing');
        await expect(payment).toContainText(choice === 'ko' ? cycle === 'month' ? '/ 월' : '/ 년' : cycle === 'month' ? '/ month' : '/ year');
      }
      await expect(page.getByRole('article', { name: 'Free', exact: true })).toContainText(choice === 'ko' ? '기간 제한 없이 무료' : 'Free with no time limit');
      await expect(page.locator('#plans')).not.toContainText(/1개월 무료|1 month free|introductory offer|무료 1개월 후|after 1 free month|혜택 적용|offer eligibility/);
      await expect(page.locator('.plan-terms')).toContainText(choice === 'ko' ? '무료 체험 없이 첫 구매부터 결제' : 'charged from the first purchase, with no free trial');
      await expect(page.locator('.plan-terms')).toContainText(choice === 'ko' ? '첫 구매 시 1년 전액' : 'full year at first purchase');
      await expect(page.locator('.plan-terms')).toContainText(choice === 'ko' ? '선택한 월간 또는 연간 주기로 자동 갱신' : 'Renews automatically on the selected monthly or annual cycle');
      for (const state of ['closed', 'expanded']) {
        await page.locator('.plan-terms').evaluate((element, open) => { (element as HTMLDetailsElement).open = open; }, state === 'expanded');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (process.env.CAPTURE_WEB) await page.locator('#plans').screenshot({ path: `.amp/in/artifacts/final-landing-${choice}-${width}-${cycle}-${state}.png` });
      }
    }
    await expect(page.locator('#plans button, #plans input')).toHaveCount(0);
    if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/copy-cleanup-${choice}-${width}.png`, fullPage: true });
  }
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
