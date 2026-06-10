import { test, expect } from '@playwright/test';

test.describe('Player Reconnection', () => {
  test.setTimeout(180000);

  test('player should rejoin game and see current question after disconnect', async ({ page }) => {
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

    await page.locator('button').filter({ hasText: /Математика|Вопросы/ }).first().click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
    const codeElement = page.locator('span.text-5xl');
    await expect(codeElement).toBeVisible();
    const lobbyCode = await codeElement.innerText();
    console.log(`Lobby code: ${lobbyCode}`);

    // Step 2: Player joins
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });

    // Step 3: Start game
    const startBtn = page.getByRole('button', { name: 'Начать игру' });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();
    await page.waitForTimeout(3000);

    // Verify host sees question
    await expect(page.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });
    
    // Verify player sees question
    await expect(player1.getByText(/1 \/ 2/)).toBeVisible({ timeout: 5000 });
    console.log('Player 1 sees question 1');

    // Step 4: Simulate player disconnect (close page and reopen)
    const playerUrl = player1.url();
    console.log(`Player URL before disconnect: ${playerUrl}`);
    
    await player1.close();
    await page.waitForTimeout(1000);

    // Step 5: Player rejoins with same name
    const player1Reconnect = await page.context().newPage();
    await player1Reconnect.goto('/player/join', { waitUntil: 'networkidle' });
    await player1Reconnect.waitForTimeout(500);
    await player1Reconnect.getByPlaceholder('123').fill(lobbyCode);
    await player1Reconnect.getByPlaceholder('Игрок').fill('Алиса');
    await player1Reconnect.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(3000);

    // Step 6: Verify reconnected player sees current question (not "Время вышло")
    await expect(player1Reconnect.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });
    console.log('Reconnected player sees current question');

    // Verify player does NOT see "Время вышло" message
    const timeoutMessage = player1Reconnect.getByText('Время вышло');
    await expect(timeoutMessage).not.toBeVisible({ timeout: 2000 });

    // Step 7: Player answers
    await player1Reconnect.getByRole('button', { name: 'C' }).click();
    await page.waitForTimeout(2000);

    // Step 8: Verify game continues to question 2
    await expect(page.getByText(/2 \/ 2/)).toBeVisible({ timeout: 10000 });
    await expect(player1Reconnect.getByText(/2 \/ 2/)).toBeVisible({ timeout: 5000 });
    console.log('Game continued to question 2 after reconnection');

    // Step 9: Answer question 2
    await player1Reconnect.getByRole('button', { name: 'D' }).click();
    await page.waitForTimeout(2000);

    // Step 10: Verify results
    await expect(page.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 10000 });
    await expect(player1Reconnect.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 5000 });
    console.log('Reconnected player sees results');
  });

  test('player should rejoin during answer reveal phase', async ({ page }) => {
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // Step 1: Create lobby
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.locator('button').filter({ hasText: /Математика|Вопросы/ }).first().click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
    const codeElement = page.locator('span.text-5xl');
    const lobbyCode = await codeElement.innerText();

    // Step 2: Two players join
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(1000);

    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await player2.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Боб');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(2000);

    // Step 3: Start game
    await page.getByRole('button', { name: 'Начать игру' }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(/1 \/ 2/)).toBeVisible({ timeout: 10000 });

    // Step 4: Both players answer
    await player1.getByRole('button', { name: 'C' }).click();
    await player2.getByRole('button', { name: 'A' }).click();
    await page.waitForTimeout(2000);

    // Step 5: Verify answer reveal phase (players see correct/incorrect)
    await expect(player1.getByText(/Правильно!|Неправильно/)).toBeVisible({ timeout: 5000 });
    console.log('Answer reveal phase started');

    // Step 6: Player 1 disconnects during answer reveal
    await player1.close();
    await page.waitForTimeout(1000);

    // Step 7: Player 1 reconnects
    const player1Reconnect = await page.context().newPage();
    await player1Reconnect.goto('/player/join', { waitUntil: 'networkidle' });
    await player1Reconnect.waitForTimeout(500);
    await player1Reconnect.getByPlaceholder('123').fill(lobbyCode);
    await player1Reconnect.getByPlaceholder('Игрок').fill('Алиса');
    await player1Reconnect.getByRole('button', { name: 'Подключиться' }).click();
    await page.waitForTimeout(3000);

    // Step 8: Reconnected player should see current question (question 2)
    // Since answer reveal auto-advances, they should see question 2
    await expect(player1Reconnect.getByText(/2 \/ 2/)).toBeVisible({ timeout: 15000 });
    console.log('Reconnected player sees question 2 after answer reveal');

    // Step 9: Answer question 2
    await player1Reconnect.getByRole('button', { name: 'D' }).click();
    await player2.getByRole('button', { name: 'D' }).click();
    await page.waitForTimeout(2000);

    // Step 10: Verify results
    await expect(page.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 10000 });
    await expect(player1Reconnect.getByRole('heading', { name: 'Результаты' })).toBeVisible({ timeout: 5000 });
    console.log('Test completed successfully');
  });
});
