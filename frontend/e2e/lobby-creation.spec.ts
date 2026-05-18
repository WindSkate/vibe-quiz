import { test, expect } from '@playwright/test';

test('should create lobby successfully', async ({ page }) => {
  // Capture errors and console logs
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`HTTP ${response.status()}: ${response.url()}`);
    }
  });

  // Go to home page
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Verify page loaded
  await expect(page.getByRole('heading', { name: 'Создать лобби' })).toBeVisible();
  
  // Click first topic (Математика)
  await page.locator('button').filter({ has: page.getByText('Математика') }).click();
  await page.waitForTimeout(300);
  
  // Take screenshot before clicking create
  await page.screenshot({ path: 'e2e/screens/before-create.png' });
  
  // Click "Создать лобби" button
  await page.getByRole('button', { name: 'Создать лобби' }).click();
  
  // Wait and check what happens
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screens/after-create.png' });
  
  const url = page.url();
  console.log('URL after create:', url);
  
  // Check if there's an error message
  const hasError = await page.getByText('Не удалось создать лобби').isVisible().catch(() => false);
  console.log('Has error message:', hasError);
  
  // Check if button is still visible (means we didn't navigate)
  const createBtnVisible = await page.getByRole('button', { name: 'Создать лобби' }).isVisible().catch(() => false);
  console.log('Create button still visible:', createBtnVisible);
  
  // If still on home page, try again
  if (url === 'http://localhost:3000/' || url === 'http://localhost:3000') {
    console.log('Still on home page, trying again...');
    await page.getByRole('button', { name: 'Создать лобби' }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e/screens/second-attempt.png' });
    console.log('URL after 2nd attempt:', page.url());
  }
  
  // Verify we're on waiting page
  await expect(page.getByText('Код лобби')).toBeVisible({ timeout: 5000 });
  
  console.log('SUCCESS: Lobby created!');
});
