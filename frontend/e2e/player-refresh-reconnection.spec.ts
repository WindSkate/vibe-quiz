import { test, expect } from '@playwright/test';

test.describe('Player Page Refresh Reconnection', () => {
  test.setTimeout(180000);

  test('player should auto-reconnect after page refresh during question', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.locator('button').filter({ hasText: /Математика|Вопросы/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
    const codeElement = page.locator('span.text-5xl');
    await expect(codeElement).toBeVisible();
    const lobbyCode = await codeElement.innerText();

    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });

    const startBtn = page.getByRole('button', { name: 'Начать игру' });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });
    await expect(player1.getByText(/1 \/ 2/)).toBeVisible({ timeout: 5000 });

    await player1.reload({ waitUntil: 'networkidle' });
    await player1.waitForTimeout(3000);

    await expect(player1.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });

    const timerAfterReconnect = player1.locator('.font-mono');
    await expect(timerAfterReconnect).toBeVisible({ timeout: 3000 });
    const timerText = await timerAfterReconnect.innerText();
    expect(timerText).toMatch(/\d+/);

    await player1.getByRole('button', { name: 'C' }).click();
    
    await expect(player1.getByRole('button', { name: /Продолжить/ })).toBeVisible({ timeout: 5000 });
    await player1.getByRole('button', { name: /Продолжить/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(/2 \/ 2/)).toBeVisible({ timeout: 10000 });
    await expect(player1.getByText(/2 \/ 2/)).toBeVisible({ timeout: 5000 });

    await player1.getByRole('button', { name: 'D' }).click();
    
    await expect(player1.getByRole('button', { name: /Продолжить/ })).toBeVisible({ timeout: 5000 });
    await player1.getByRole('button', { name: /Продолжить/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 10000 });
    await expect(player1.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 5000 });
  });
});
