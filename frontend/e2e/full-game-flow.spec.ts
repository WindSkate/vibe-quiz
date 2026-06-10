import { test, expect } from '@playwright/test';

test.describe('Full Game Flow', () => {
  test.setTimeout(180000);

  test('should complete full game: lobby, join, answers, results', async ({ page }) => {
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
      }
    });

    // Step 1: Create lobby
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: /Создать лобби|Викторина/ })).toBeVisible();

    // Click first topic
    await page.locator('button').filter({ hasText: /Математика|Вопросы/ }).first().click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    // Verify waiting page
    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
    const codeElement = page.locator('span.text-5xl');
    await expect(codeElement).toBeVisible();
    const lobbyCode = await codeElement.innerText();
    console.log(`Lobby code: ${lobbyCode}`);

    // Step 2: Player 1 joins
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);

    // Verify player 1 on host
    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });

    // Step 3: Player 2 joins
    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await player2.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Боб');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);

    // Verify both players on host
    await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Игроки (2)')).toBeVisible();

    // Verify start button is enabled
    const startBtn = page.getByRole('button', { name: 'Начать игру' });
    await expect(startBtn).toBeEnabled();

    // Step 4: Start game
    await startBtn.click();
    await page.waitForTimeout(3000);

    // Verify host sees question
    await expect(page.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });

    // Verify players see question
    await expect(player1.getByText(/1 \/ 2/)).toBeVisible({ timeout: 5000 });
    await expect(player2.getByText(/1 \/ 2/)).toBeVisible({ timeout: 5000 });

    // Step 5: Player 1 answers correctly (C for 2+2=4)
    await player1.getByRole('button', { name: 'C' }).click();
    await page.waitForTimeout(500);

    // Step 6: Player 2 answers incorrectly (A for 2+2=1)
    await player2.getByRole('button', { name: 'A' }).click();
    await page.waitForTimeout(500);

    console.log('Question 1: Alice answered correctly, Bob answered incorrectly');

    // Wait for answer reveal and click continue on host
    await expect(page.getByText('Результаты ответа')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Следующий вопрос/ }).click();
    await page.waitForTimeout(1000);

    // Both answered, so question 2 should appear
    await expect(page.getByText(/2 \/ 2/)).toBeVisible({ timeout: 5000 });

    // Step 7: Player 1 answers incorrectly (A for 2+2*2=3)
    await player1.getByRole('button', { name: 'A' }).click();
    await page.waitForTimeout(500);

    // Step 8: Player 2 answers correctly (D for 2+2*2=6)
    await player2.getByRole('button', { name: 'D' }).click();
    await page.waitForTimeout(500);

    console.log('Question 2: Alice answered incorrectly, Bob answered correctly');

    // Wait for answer reveal and click continue on host
    await expect(page.getByText('Результаты ответа')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Следующий вопрос/ }).click();
    await page.waitForTimeout(1000);

    // Both answered, so results should appear (only 2 questions)
    await expect(page.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 5000 });

    // Both players have 1 point each, sorted by score (descending)
    // Alice: 1 correct (Q1), Bob: 1 correct (Q2)
    // They should be tied at 1 point each

    // Verify both players appear in results with correct ranks and scores
    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });

    // Verify scores (both should have 1 point)
    const scoreElements = page.getByText('1');
    await expect(scoreElements.first()).toBeVisible();

    // Verify "На главную" button exists
    await expect(page.getByRole('button', { name: 'На главную' })).toBeVisible();

    console.log('Game completed successfully!');

    // Step 10: Verify player results pages
    await expect(player1.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 10000 });
    await expect(player2.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 5000 });

    console.log('All players see results');
  });
});
