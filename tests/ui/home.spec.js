import { test, expect } from '@playwright/test';

function uid() {
    return `test_${Math.random().toString(36).slice(2)}@test.com`;
}

async function registerAndSetup(page) {
    await page.goto('/register');
    await page.fill('[name="name"]', 'Home User');
    await page.fill('[name="email"]', uid());
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    await page.waitForURL('/setup');
    await page.fill('[name="calories"]', '2000');
    await page.fill('[name="protein"]', '150');
    await page.fill('[name="carbs"]', '250');
    await page.fill('[name="fats"]', '65');
    await page.fill('[name="fibre"]', '30');
    await page.click('[type="submit"]');
    await page.waitForURL('/home');
}

test.describe('Home page', () => {
    test('shows CalTrack header and logout button', async ({ page }) => {
        await registerAndSetup(page);
        await expect(page.locator('.logo')).toContainText('CalTrack');
        await expect(page.locator('.logout-btn')).toBeVisible();
    });

    test('shows empty state when no meals logged', async ({ page }) => {
        await registerAndSetup(page);
        await expect(page.locator('.empty-state')).toBeVisible();
    });

    test('meal type radio options are present', async ({ page }) => {
        await registerAndSetup(page);
        for (const type of ['breakfast', 'lunch', 'snack', 'dinner']) {
            await expect(page.locator(`[value="${type}"]`)).toBeAttached();
        }
    });

    test('breakfast is selected by default', async ({ page }) => {
        await registerAndSetup(page);
        await expect(page.locator('#breakfast')).toBeChecked();
    });

    test('add item button appends a new row', async ({ page }) => {
        await registerAndSetup(page);
        const before = await page.locator('.item-row').count();
        await page.click('button:has-text("+ add item")');
        expect(await page.locator('.item-row').count()).toBe(before + 1);
    });

    test('remove button on extra row deletes that row', async ({ page }) => {
        await registerAndSetup(page);
        await page.click('button:has-text("+ add item")');
        const before = await page.locator('.item-row').count();
        await page.locator('.btn-danger').first().click();
        expect(await page.locator('.item-row').count()).toBe(before - 1);
    });

    test('meal card expands to show macros', async ({ page }) => {
        await registerAndSetup(page);
        // add a meal
        await page.fill('[name="fooditem[]"]', 'chicken');
        await page.fill('[name="quantity[]"]', '100');
        await page.click('[type="submit"]');
        await page.waitForURL('/home');
        // expand the details element
        await page.locator('details.meal-card').first().click();
        await expect(page.locator('.macro-row')).toBeVisible();
    });

    test('meal card shows mealtype as title', async ({ page }) => {
        await registerAndSetup(page);
        await page.locator('label[for="dinner"]').click();
        await page.fill('[name="fooditem[]"]', 'chicken');
        await page.fill('[name="quantity[]"]', '100');
        await page.click('[type="submit"]');
        await page.waitForURL('/home');
        await expect(page.locator('.meal-name').first()).toContainText('dinner');
    });

    test('unauthenticated /home redirects to /login', async ({ page }) => {
        await page.goto('/home');
        await expect(page).toHaveURL('/login');
    });
});
