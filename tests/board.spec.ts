import { test, expect } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`demo states, navigation and no usage requests at ${width}px`, async ({ page }) => {
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
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
      await expect(board.getByRole('progressbar')).toHaveCount(scenario === 'unknown' ? 0 : 6);
      if (scenario === 'unknown') await expect(board.getByText('알 수 없음', { exact: true })).toHaveCount(7);
      if (scenario === 'stale') {
        await expect(board.getByText('DEMO · STALE', { exact: true })).toHaveCount(4);
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
    await page.keyboard.press('Tab');
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
