import { test, expect } from '@playwright/test';

function uid() {
    return `test_${Math.random().toString(36).slice(2)}@test.com`;
}

async function registerUser(page, name = 'Setup User') {
    await page.goto('/register');
    await page.fill('[name="name"]', name);
    await page.fill('[name="email"]', uid());
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    await page.waitForURL('/setup');
}

test.describe('Setup / Goals', () => {
    test('renders all goal fields', async ({ page }) => {
        await registerUser(page);
        for (const field of ['calories', 'protein', 'carbs', 'fats', 'fibre']) {
            await expect(page.locator(`[name="${field}"]`)).toBeVisible();
        }
    });

    test('greets user by name', async ({ page }) => {
        await registerUser(page, 'Alice');
        await expect(page.locator('.subtitle')).toContainText('Alice');
    });

    test('submitting goals redirects to /home', async ({ page }) => {
        await registerUser(page);
        await page.fill('[name="calories"]', '2000');
        await page.fill('[name="protein"]', '150');
        await page.fill('[name="carbs"]', '250');
        await page.fill('[name="fats"]', '65');
        await page.fill('[name="fibre"]', '30');
        await page.click('[type="submit"]');
        await expect(page).toHaveURL('/home');
    });

    test('unauthenticated /setup redirects to /login', async ({ page }) => {
        await page.goto('/setup');
        await expect(page).toHaveURL('/login');
    });

    test('/home without goals redirects to /setup', async ({ page }) => {
        await registerUser(page);
        await page.goto('/home');
        await expect(page).toHaveURL('/setup');
    });

    test('returning to /setup pre-fills saved goals', async ({ page }) => {
        await registerUser(page);
        await page.fill('[name="calories"]', '2500');
        await page.fill('[name="protein"]', '180');
        await page.fill('[name="carbs"]', '300');
        await page.fill('[name="fats"]', '70');
        await page.fill('[name="fibre"]', '35');
        await page.click('[type="submit"]');
        await page.goto('/setup');
        await expect(page.locator('[name="calories"]')).toHaveValue('2500');
        await expect(page.locator('[name="protein"]')).toHaveValue('180');
    });
});
