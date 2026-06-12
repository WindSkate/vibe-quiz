import { test, expect } from '@playwright/test';

test.describe('Lobby Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => {
      // Ignore STOMP connection errors during tests
      if (!error.message.includes('STOMP')) {
        console.log('PAGE ERROR:', error.message);
      }
    });
  });

  test('should create lobby and navigate to waiting page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: 'Создать лобби' })).toBeVisible();

    // Click first topic
    await page.locator('button').filter({ has: page.getByText('Математика') }).first().click();
    await page.waitForTimeout(300);

    // Click "Создать лобби"
    await page.getByRole('button', { name: 'Создать лобби' }).click();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify waiting page
    await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });

    // Verify 3-digit code
    const codeElement = page.locator('span.text-5xl');
    await expect(codeElement).toBeVisible();
    const code = await codeElement.innerText();
    expect(code).toMatch(/^\d{3}$/);

    // Verify "Начать игру" button is disabled (no players)
    const startBtn = page.getByRole('button', { name: 'Начать игру' });
    await expect(startBtn).toBeDisabled();

    console.log(`Lobby created with code: ${code}`);
  });

  test('should show "Подключиться к лобби" button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check for join button
    await expect(page.getByText('Подключиться к лобби')).toBeVisible();
  });
});

test.describe('Player Join Flow', () => {
  let lobbyCode: string;

  test.beforeEach(async ({ page }) => {
    // Create lobby first
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.locator('button').filter({ has: page.getByText('Математика') }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(2000);

    // Get lobby code
    const codeElement = page.locator('span.text-5xl');
    await expect(codeElement).toBeVisible();
    lobbyCode = await codeElement.innerText();
    console.log(`Test lobby code: ${lobbyCode}`);
  });

  test('should join lobby with 1 player', async ({ page }) => {
    // Open new tab for player
    const playerPage = await page.context().newPage();
    await playerPage.goto('/player/join', { waitUntil: 'networkidle' });
    await playerPage.waitForTimeout(500);

    // Enter code and name
    await playerPage.getByPlaceholder('123').fill(lobbyCode);
    await playerPage.getByPlaceholder('Игрок').fill('ТестИгрок1');
    await playerPage.getByRole('button', { name: 'Подключиться' }).click();

    // Wait for player to appear on host page (indicates join succeeded)
    await page.waitForTimeout(2000);
    await expect(page.getByText('ТестИгрок1')).toBeVisible({ timeout: 10000 });

    // Verify start button is now enabled
    const startBtn = page.getByRole('button', { name: 'Начать игру' });
    await expect(startBtn).toBeEnabled();

    console.log('1 player joined successfully');
  });

  test('should join lobby with 2 players', async ({ page }) => {
    // Player 1
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Игрок1');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await player1.waitForTimeout(1500);

    // Player 2
    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await player2.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Игрок2');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await player2.waitForTimeout(1500);

    // Verify both players on host page
    await page.waitForTimeout(1000);
    await expect(page.getByText('Игрок1')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Игрок2')).toBeVisible({ timeout: 5000 });

    // Verify player count
    const playerCount = page.getByText('Игроки (2)');
    await expect(playerCount).toBeVisible();

    console.log('2 players joined successfully');
  });

  test('should join lobby with 3 players', async ({ page }) => {
    // Player 1
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Алиса');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await player1.waitForTimeout(1500);

    // Player 2
    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await player2.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Боб');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await player2.waitForTimeout(1500);

    // Player 3
    const player3 = await page.context().newPage();
    await player3.goto('/player/join', { waitUntil: 'networkidle' });
    await player3.waitForTimeout(500);
    await player3.getByPlaceholder('123').fill(lobbyCode);
    await player3.getByPlaceholder('Игрок').fill('Чарли');
    await player3.getByRole('button', { name: 'Подключиться' }).click();
    await player3.waitForTimeout(1500);

    // Verify all 3 players on host page
    await page.waitForTimeout(1000);
    await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Чарли')).toBeVisible({ timeout: 5000 });

    // Verify player count
    const playerCount = page.getByText('Игроки (3)');
    await expect(playerCount).toBeVisible();

    console.log('3 players joined successfully');
  });

  test('should show error for duplicate player name', async ({ page }) => {
    // Player joins first time
    const player1 = await page.context().newPage();
    await player1.goto('/player/join', { waitUntil: 'networkidle' });
    await player1.waitForTimeout(500);
    await player1.getByPlaceholder('123').fill(lobbyCode);
    await player1.getByPlaceholder('Игрок').fill('Повторюшка');
    await player1.getByRole('button', { name: 'Подключиться' }).click();
    await player1.waitForTimeout(1500);

    // Another player tries to join with same name (without playerId)
    const player2 = await page.context().newPage();
    await player2.goto('/player/join', { waitUntil: 'networkidle' });
    await player2.waitForTimeout(500);
    await player2.getByPlaceholder('123').fill(lobbyCode);
    await player2.getByPlaceholder('Игрок').fill('Повторюшка');
    await player2.getByRole('button', { name: 'Подключиться' }).click();
    await player2.waitForTimeout(1500);

    // Verify error message is shown
    await expect(player2.getByText('Игрок с таким именем уже существует')).toBeVisible({ timeout: 5000 });

    // Verify only 1 player in lobby
    await page.waitForTimeout(1000);
    const playerCount = page.getByText('Игроки (1)');
    await expect(playerCount).toBeVisible({ timeout: 5000 });

    console.log('Duplicate player name error shown correctly');
  });
});

test.describe('Player Join - Edge Cases', () => {
  test('should show error for invalid lobby code', async ({ page }) => {
    await page.goto('/player/join', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.getByPlaceholder('123').fill('999');
    await page.getByPlaceholder('Игрок').fill('Тест');
    await page.getByRole('button', { name: 'Подключиться' }).click();

    await page.waitForTimeout(1000);

    // Should show error
    const errorText = await page.getByText('Лобби не найдено').isVisible().catch(() => false);
    expect(errorText).toBe(true);

    console.log('Invalid lobby code error shown');
  });

  test('should show error for empty name', async ({ page }) => {
    await page.goto('/player/join', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.getByPlaceholder('123').fill('123');
    // Leave name empty
    await page.waitForTimeout(500);

    // Button should be disabled
    const btn = page.getByRole('button', { name: 'Подключиться' });
    await expect(btn).toBeDisabled();

    console.log('Empty name validation works');
  });
});
