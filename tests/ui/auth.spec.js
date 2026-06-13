import { test, expect } from '@playwright/test';

function uid() {
    return `test_${Math.random().toString(36).slice(2)}@test.com`;
}

test.describe('Authentication', () => {
    test('register page renders correctly', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('.logo')).toContainText('CalTrack');
        await expect(page.locator('[name="name"]')).toBeVisible();
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
    });

    test('register redirects to /setup', async ({ page }) => {
        await page.goto('/register');
        await page.fill('[name="name"]', 'Test User');
        await page.fill('[name="email"]', uid());
        await page.fill('[name="password"]', 'testpass');
        await page.click('[type="submit"]');
        await expect(page).toHaveURL('/setup');
    });

    test('duplicate email shows error', async ({ page }) => {
        const email = uid();
        await page.goto('/register');
        await page.fill('[name="name"]', 'A'); await page.fill('[name="email"]', email); await page.fill('[name="password"]', 'pw');
        await page.click('[type="submit"]');
        await page.goto('/register');
        await page.fill('[name="name"]', 'B'); await page.fill('[name="email"]', email); await page.fill('[name="password"]', 'pw');
        await page.click('[type="submit"]');
        await expect(page.locator('.error')).toContainText('email already in use');
    });

    test('login page renders correctly', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
    });

    test('login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('[name="email"]', 'nobody@test.com');
        await page.fill('[name="password"]', 'wrong');
        await page.click('[type="submit"]');
        await expect(page.locator('.error')).toBeVisible();
    });

    test('logout redirects to /login', async ({ page }) => {
        const email = uid();
        await page.goto('/register');
        await page.fill('[name="name"]', 'Logout User');
        await page.fill('[name="email"]', email);
        await page.fill('[name="password"]', 'testpass');
        await page.click('[type="submit"]');
        // complete setup
        await page.fill('[name="calories"]', '2000'); await page.fill('[name="protein"]', '150');
        await page.fill('[name="carbs"]', '250'); await page.fill('[name="fats"]', '65'); await page.fill('[name="fibre"]', '30');
        await page.click('[type="submit"]');
        await page.waitForURL('/home');
        await page.click('.logout-btn');
        await expect(page).toHaveURL('/login');
    });
});
