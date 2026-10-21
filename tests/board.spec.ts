import { test, expect } from '@playwright/test';
test.use({ locale: 'ko-KR' });

for (const width of [320, 390, 1440]) {
  test(`demo states, navigation and no usage requests at ${width}px`, async ({ page, browserName }) => {
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    for (const target of await page.locator('nav a, button, select, .cta').all()) {
      expect((await target.boundingBox())!.height, await target.evaluate(element => element.outerHTML)).toBeGreaterThanOrEqual(44);
    }
    const board = page.getByRole('region', { name: '고정 예시 사용량 보드' });
    const select = page.getByRole('combobox', { name: '예시 상태' });
    const replay = page.getByRole('button', { name: '예시 다시 보기' });
    await expect(board.locator('.provider-icon')).toHaveCount(4);
    await expect(board.getByRole('progressbar')).toHaveCount(6);
    expect(await board.getByRole('progressbar').evaluateAll(bars => bars.map(bar => (bar as HTMLProgressElement).value))).toEqual([72, 91, 84, 63, 88, 96]);
    await expect(board.getByText('플랜 알 수 없음')).toBeVisible();
    await expect(board.getByText('알 수 없음', { exact: true })).toHaveCount(1);
    if (process.env.CAPTURE_WEB && width === 1440) await board.screenshot({ path: '.amp/in/artifacts/landing-normal-desktop.png' });
    for (const scenario of ['normal', 'unknown', 'stale']) {
      await select.selectOption(scenario);
      await expect(select).toHaveAccessibleDescription(scenario === 'normal' ? /고정 예시 데이터입니다/ : scenario === 'unknown' ? /알 수 없음은 0%가 아닙니다/ : /현재 사용량이 아닙니다/);
      await expect(board.getByRole('progressbar')).toHaveCount(scenario === 'unknown' ? 0 : 6);
      if (scenario === 'unknown') await expect(board.getByText('알 수 없음', { exact: true })).toHaveCount(7);
      if (scenario === 'stale') {
        await expect(board.getByText('DEMO · 오래됨 · STALE', { exact: true })).toHaveCount(4);
        for (const bar of await board.getByRole('progressbar').all()) await expect(bar).toHaveAttribute('aria-valuetext', /현재 사용량 아님/);
      }
      await replay.focus(); await page.keyboard.press('Enter');
      await expect(replay).toBeFocused();
      await expect(page.getByRole('status')).toContainText('예시 다시 보기 1회 (네트워크 갱신 없음)');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (process.env.CAPTURE_WEB && width === 390) await page.locator('#demo').screenshot({ path: `.amp/in/artifacts/landing-${scenario}-mobile.png` });
    }
    await page.goto('/');
    await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeAttached();
    // macOS Safari uses Option-Tab to include links in keyboard navigation.
    // Keep the real focus/activation assertions, not a programmatic focus shortcut.
    await page.keyboard.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
    await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    for (const anchor of ['privacy', 'refresh-policy']) {
      await page.locator(`nav a[href="#${anchor}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
    }
    await page.getByRole('link', { name: '아이콘 라이선스 및 고지' }).click();
    await expect(page).toHaveURL(/THIRD_PARTY_NOTICES\.md$/);
    expect(errors).toEqual([]);
    const origin = new URL(page.url()).origin;
    expect(requests.every(url => new URL(url).origin === origin && !url.includes('/v1/') && !url.includes('/v2/'))).toBe(true);
  });
}

for (const width of [320, 1440]) for (const colorScheme of ['light', 'dark'] as const) {
  test(`Allowmark layout and honest states: ${width}/${colorScheme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    for (const language of ['en', 'ko']) {
      await page.locator('header select').selectOption(language);
      await expect(page).toHaveTitle(/Allowmark/);
      await expect(page.locator('body')).not.toContainText('QuotaDock');
      const sourceLinks = page.getByRole('link', { name: language === 'ko' ? '소스 ↗' : 'Source ↗', exact: true });
      await expect(sourceLinks.nth(0)).toHaveAttribute('href', 'https://github.com/quotadock-dev/quotadock');
      await expect(sourceLinks.nth(1)).toHaveAttribute('href', 'https://github.com/quotadock-dev/quotadock#readme');
      await expect(page.getByRole('link', { name: 'GitHub ↗', exact: true })).toHaveAttribute('href', 'https://github.com/quotadock-dev/quotadock');
      for (const state of ['normal', 'empty', 'unknown', 'stale']) {
        await page.locator('#scenario').selectOption(state);
        const bars = page.getByRole('progressbar');
        await expect(bars).toHaveCount(state === 'unknown' ? 0 : 6);
        if (state === 'empty') expect(await bars.evaluateAll(nodes => nodes.map(node => (node as HTMLProgressElement).value))).toEqual([0, 0, 0, 0, 0, 0]);
        if (state === 'stale') await expect(page.locator('time[datetime="2026-05-01T09:41:00Z"]')).toHaveCount(4);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        if (width === 1440 && state === 'normal') {
          const boxes = await bars.evaluateAll(nodes => nodes.map(node => ({ left: node.getBoundingClientRect().left, width: node.getBoundingClientRect().width })));
          expect(new Set(boxes.map(box => box.left)).size).toBe(1);
          expect(boxes.every(box => box.width > 650)).toBe(true);
        }
        if (process.env.CAPTURE_WEB) await page.screenshot({ path: `.amp/in/artifacts/allowmark-${language}-${width}-${colorScheme}-${state}.png`, fullPage: true });
      }
    }
  });
}
