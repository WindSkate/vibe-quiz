# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lobby-creation.spec.ts >> Player Join Flow >> should handle duplicate player name (same player reconnecting)
- Location: e2e\lobby-creation.spec.ts:168:3

# Error details

```
Error: locator.click: Error: strict mode violation: locator('button').filter({ has: getByText('Математика') }) resolved to 2 elements:
    1) <button class="w-full text-left p-4 rounded-xl border transition-all border-gray-700/50 bg-gray-800/40 hover:border-gray-600">…</button> aka getByRole('button', { name: 'Математика для теста' })
    2) <button class="w-full text-left p-4 rounded-xl border transition-all border-gray-700/50 bg-gray-800/40 hover:border-gray-600">…</button> aka getByRole('button', { name: 'Вопросы от Qwen3.7 Plus' })

Call log:
  - waiting for locator('button').filter({ has: getByText('Математика') })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Создать лобби" [level=1] [ref=e5]
  - paragraph [ref=e6]: Выберите тему для викторины
  - generic [ref=e7]:
    - button "Математика для теста" [ref=e8] [cursor=pointer]:
      - heading "Математика" [level=3] [ref=e9]
      - paragraph [ref=e10]: для теста
    - button "Фильмы Вопросы о фильмах, режиссёрах и актёрах" [ref=e11] [cursor=pointer]:
      - heading "Фильмы" [level=3] [ref=e12]
      - paragraph [ref=e13]: Вопросы о фильмах, режиссёрах и актёрах
    - button "Угадай фильм Угадайте фильм по схематичной иллюстрации от ИИ" [ref=e14] [cursor=pointer]:
      - heading "Угадай фильм" [level=3] [ref=e15]
      - paragraph [ref=e16]: Угадайте фильм по схематичной иллюстрации от ИИ
    - button "Угадай сериал Угадайте сериал по схематичной иллюстрации от ИИ" [ref=e17] [cursor=pointer]:
      - heading "Угадай сериал" [level=3] [ref=e18]
      - paragraph [ref=e19]: Угадайте сериал по схематичной иллюстрации от ИИ
    - button "Угадай игру Угадайте игру по схематичной иллюстрации от ИИ" [ref=e20] [cursor=pointer]:
      - heading "Угадай игру" [level=3] [ref=e21]
      - paragraph [ref=e22]: Угадайте игру по схематичной иллюстрации от ИИ
    - 'button "Вопросы от Qwen3.7 Plus Сборная солянка интересных вопросов от ИИ: наука, география, математика, искусство и логика. С иллюстрациями!" [ref=e23] [cursor=pointer]':
      - heading "Вопросы от Qwen3.7 Plus" [level=3] [ref=e24]
      - paragraph [ref=e25]: "Сборная солянка интересных вопросов от ИИ: наука, география, математика, искусство и логика. С иллюстрациями!"
  - paragraph [ref=e26]:
    - button "Управление темами →" [ref=e27] [cursor=pointer]
  - button "Создать лобби" [disabled] [ref=e28]
  - generic [ref=e29]:
    - paragraph [ref=e30]: Хотите присоединиться к игре?
    - button "Подключиться к лобби →" [ref=e31] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Lobby Creation Flow', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     page.on('pageerror', error => {
  6   |       // Ignore STOMP connection errors during tests
  7   |       if (!error.message.includes('STOMP')) {
  8   |         console.log('PAGE ERROR:', error.message);
  9   |       }
  10  |     });
  11  |   });
  12  | 
  13  |   test('should create lobby and navigate to waiting page', async ({ page }) => {
  14  |     await page.goto('/', { waitUntil: 'networkidle' });
  15  |     await page.waitForTimeout(1000);
  16  | 
  17  |     await expect(page.getByRole('heading', { name: 'Создать лобби' })).toBeVisible();
  18  | 
  19  |     // Click first topic
  20  |     await page.locator('button').filter({ has: page.getByText('Математика') }).click();
  21  |     await page.waitForTimeout(300);
  22  | 
  23  |     // Click "Создать лобби"
  24  |     await page.getByRole('button', { name: 'Создать лобби' }).click();
  25  | 
  26  |     // Wait for navigation
  27  |     await page.waitForTimeout(2000);
  28  | 
  29  |     // Verify waiting page
  30  |     await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
  31  | 
  32  |     // Verify 3-digit code
  33  |     const codeElement = page.locator('span.text-5xl');
  34  |     await expect(codeElement).toBeVisible();
  35  |     const code = await codeElement.innerText();
  36  |     expect(code).toMatch(/^\d{3}$/);
  37  | 
  38  |     // Verify "Начать игру" button is disabled (no players)
  39  |     const startBtn = page.getByRole('button', { name: 'Начать игру' });
  40  |     await expect(startBtn).toBeDisabled();
  41  | 
  42  |     console.log(`Lobby created with code: ${code}`);
  43  |   });
  44  | 
  45  |   test('should show "Подключиться к лобби" button', async ({ page }) => {
  46  |     await page.goto('/', { waitUntil: 'networkidle' });
  47  |     await page.waitForTimeout(1000);
  48  | 
  49  |     // Check for join button
  50  |     await expect(page.getByText('Подключиться к лобби')).toBeVisible();
  51  |   });
  52  | });
  53  | 
  54  | test.describe('Player Join Flow', () => {
  55  |   let lobbyCode: string;
  56  | 
  57  |   test.beforeEach(async ({ page }) => {
  58  |     // Create lobby first
  59  |     await page.goto('/', { waitUntil: 'networkidle' });
  60  |     await page.waitForTimeout(1000);
  61  | 
> 62  |     await page.locator('button').filter({ has: page.getByText('Математика') }).click();
      |                                                                                ^ Error: locator.click: Error: strict mode violation: locator('button').filter({ has: getByText('Математика') }) resolved to 2 elements:
  63  |     await page.waitForTimeout(300);
  64  |     await page.getByRole('button', { name: 'Создать лобби' }).click();
  65  |     await page.waitForTimeout(2000);
  66  | 
  67  |     // Get lobby code
  68  |     const codeElement = page.locator('span.text-5xl');
  69  |     await expect(codeElement).toBeVisible();
  70  |     lobbyCode = await codeElement.innerText();
  71  |     console.log(`Test lobby code: ${lobbyCode}`);
  72  |   });
  73  | 
  74  |   test('should join lobby with 1 player', async ({ page }) => {
  75  |     // Open new tab for player
  76  |     const playerPage = await page.context().newPage();
  77  |     await playerPage.goto('/player/join', { waitUntil: 'networkidle' });
  78  |     await playerPage.waitForTimeout(500);
  79  | 
  80  |     // Enter code and name
  81  |     await playerPage.getByPlaceholder('123').fill(lobbyCode);
  82  |     await playerPage.getByPlaceholder('Игрок').fill('ТестИгрок1');
  83  |     await playerPage.getByRole('button', { name: 'Подключиться' }).click();
  84  | 
  85  |     // Wait for player to appear on host page (indicates join succeeded)
  86  |     await page.waitForTimeout(2000);
  87  |     await expect(page.getByText('ТестИгрок1')).toBeVisible({ timeout: 10000 });
  88  | 
  89  |     // Verify start button is now enabled
  90  |     const startBtn = page.getByRole('button', { name: 'Начать игру' });
  91  |     await expect(startBtn).toBeEnabled();
  92  | 
  93  |     console.log('1 player joined successfully');
  94  |   });
  95  | 
  96  |   test('should join lobby with 2 players', async ({ page }) => {
  97  |     // Player 1
  98  |     const player1 = await page.context().newPage();
  99  |     await player1.goto('/player/join', { waitUntil: 'networkidle' });
  100 |     await player1.waitForTimeout(500);
  101 |     await player1.getByPlaceholder('123').fill(lobbyCode);
  102 |     await player1.getByPlaceholder('Игрок').fill('Игрок1');
  103 |     await player1.getByRole('button', { name: 'Подключиться' }).click();
  104 |     await player1.waitForTimeout(1500);
  105 | 
  106 |     // Player 2
  107 |     const player2 = await page.context().newPage();
  108 |     await player2.goto('/player/join', { waitUntil: 'networkidle' });
  109 |     await player2.waitForTimeout(500);
  110 |     await player2.getByPlaceholder('123').fill(lobbyCode);
  111 |     await player2.getByPlaceholder('Игрок').fill('Игрок2');
  112 |     await player2.getByRole('button', { name: 'Подключиться' }).click();
  113 |     await player2.waitForTimeout(1500);
  114 | 
  115 |     // Verify both players on host page
  116 |     await page.waitForTimeout(1000);
  117 |     await expect(page.getByText('Игрок1')).toBeVisible({ timeout: 5000 });
  118 |     await expect(page.getByText('Игрок2')).toBeVisible({ timeout: 5000 });
  119 | 
  120 |     // Verify player count
  121 |     const playerCount = page.getByText('Игроки (2)');
  122 |     await expect(playerCount).toBeVisible();
  123 | 
  124 |     console.log('2 players joined successfully');
  125 |   });
  126 | 
  127 |   test('should join lobby with 3 players', async ({ page }) => {
  128 |     // Player 1
  129 |     const player1 = await page.context().newPage();
  130 |     await player1.goto('/player/join', { waitUntil: 'networkidle' });
  131 |     await player1.waitForTimeout(500);
  132 |     await player1.getByPlaceholder('123').fill(lobbyCode);
  133 |     await player1.getByPlaceholder('Игрок').fill('Алиса');
  134 |     await player1.getByRole('button', { name: 'Подключиться' }).click();
  135 |     await player1.waitForTimeout(1500);
  136 | 
  137 |     // Player 2
  138 |     const player2 = await page.context().newPage();
  139 |     await player2.goto('/player/join', { waitUntil: 'networkidle' });
  140 |     await player2.waitForTimeout(500);
  141 |     await player2.getByPlaceholder('123').fill(lobbyCode);
  142 |     await player2.getByPlaceholder('Игрок').fill('Боб');
  143 |     await player2.getByRole('button', { name: 'Подключиться' }).click();
  144 |     await player2.waitForTimeout(1500);
  145 | 
  146 |     // Player 3
  147 |     const player3 = await page.context().newPage();
  148 |     await player3.goto('/player/join', { waitUntil: 'networkidle' });
  149 |     await player3.waitForTimeout(500);
  150 |     await player3.getByPlaceholder('123').fill(lobbyCode);
  151 |     await player3.getByPlaceholder('Игрок').fill('Чарли');
  152 |     await player3.getByRole('button', { name: 'Подключиться' }).click();
  153 |     await player3.waitForTimeout(1500);
  154 | 
  155 |     // Verify all 3 players on host page
  156 |     await page.waitForTimeout(1000);
  157 |     await expect(page.getByText('Алиса')).toBeVisible({ timeout: 5000 });
  158 |     await expect(page.getByText('Боб')).toBeVisible({ timeout: 5000 });
  159 |     await expect(page.getByText('Чарли')).toBeVisible({ timeout: 5000 });
  160 | 
  161 |     // Verify player count
  162 |     const playerCount = page.getByText('Игроки (3)');
```