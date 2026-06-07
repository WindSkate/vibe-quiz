import { test, expect } from '@playwright/test';

test.describe('All Players Answered - Skip Timer', () => {
  test.setTimeout(120000);

  test('should skip to next question when all players answered', async ({ page }) => {
    page.on('pageerror', error => {
      if (!error.message.includes('STOMP')) {
        console.log('PAGE ERROR:', error.message);
      }
    });

    // Step 1: Create lobby
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: /Создать лобби|Викторина/ })).toBeVisible();
    await page.locator('button').filter({ hasText: /Математика|Вопросы/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
    const lobbyCode = await page.locator('span.text-5xl').innerText();
    console.log(`Lobby code: ${lobbyCode}`);

    // Step 2: Player 1 joins
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });

    // Step 3: Player 2 joins
    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Боб');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });

    // Step 4: Start game
    await page.getByRole('button', { name: 'Начать игру' }).click();
    await page.waitForTimeout(3000);

    // Verify question 1 appears
    await expect(page.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });
    console.log('Question 1 visible on host');

    // Step 5: Both players answer immediately
    await player1.getByRole('button', { name: 'C' }).click();
    await page.waitForTimeout(300);
    await player2.getByRole('button', { name: 'D' }).click();
    await page.waitForTimeout(300);

    console.log('Both players answered question 1');

    // Step 6: Verify question 2 appears quickly (within 5 seconds, not 30s timer)
    const startTime = Date.now();
    await expect(page.getByText(/2 \/ 2/)).toBeVisible({ timeout: 10000 });
    const elapsed = Date.now() - startTime;

    console.log(`Question 2 appeared after ${elapsed}ms (should be < 5000ms)`);

    // Verify it appeared quickly (not after 30s timer)
    expect(elapsed).toBeLessThan(8000);

    // Step 7: Both answer question 2
    await player1.getByRole('button', { name: 'A' }).click();
    await page.waitForTimeout(300);
    await player2.getByRole('button', { name: 'D' }).click();
    await page.waitForTimeout(300);

    console.log('Both players answered question 2');

    // Step 8: Verify results appear quickly (only 2 questions in test data)
    const resultsStart = Date.now();
    await expect(page.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 10000 });
    const resultsElapsed = Date.now() - resultsStart;

    console.log(`Results appeared after ${resultsElapsed}ms (should be < 5000ms)`);
    expect(resultsElapsed).toBeLessThan(8000);

    // Verify results
    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });

    console.log('Test passed: questions skipped immediately when all players answered');
  });
});
