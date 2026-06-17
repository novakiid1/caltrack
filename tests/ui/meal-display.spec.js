import { test, expect } from '@playwright/test';

async function seedAndLogin(page, request, count = 3) {
    const res = await request.post(`/test/seed?count=${count}`);
    const data = await res.json();

    await page.goto('/login');
    await page.fill('[name="email"]', data.email);
    await page.fill('[name="password"]', data.password);
    await page.click('[type="submit"]');
    await page.waitForURL('/home');

    return data;
}

test.describe('Meal display (mocked DB)', () => {
    test('seeded meals appear as cards', async ({ page, request }) => {
        await seedAndLogin(page, request, 3);
        await expect(page.locator('details.meal-card')).toHaveCount(3);
    });

    test('all daily meals shown (no cap)', async ({ page, request }) => {
        await seedAndLogin(page, request, 6);
        await expect(page.locator('details.meal-card')).toHaveCount(6);
    });

    test('most recent meal is last (meals shown in chronological order)', async ({ page, request }) => {
        const { latestMealtype } = await seedAndLogin(page, request, 3);
        await expect(page.locator('.mealtype-pill').last()).toContainText(latestMealtype);
    });

    test('meal card shows the correct calorie total from DB', async ({ page, request }) => {
        const { latestCalories } = await seedAndLogin(page, request, 1);
        const kcalText = await page.locator('.meal-kcal').first().textContent();
        expect(kcalText).toContain(String(latestCalories));
    });

    test('expanded card shows food item name and quantity with correct unit', async ({ page, request }) => {
        const { latestFoodName, latestFoodUnit } = await seedAndLogin(page, request, 1);
        const card = page.locator('details.meal-card').first();
        await card.click();
        await expect(card.locator('.detail-item-name').first()).toContainText(latestFoodName);

        // unit=g → '100g', unit=unit → '100 units'
        const expectedQty = latestFoodUnit === 'unit' ? '100 units' : `100${latestFoodUnit}`;
        await expect(card.locator('.detail-item-qty').first()).toContainText(expectedQty);
    });

    test('unit items (egg) display as "units" not grams', async ({ page, request }) => {
        // count=3 → foods cycle: chicken(0), rice(1), egg(2); egg is last
        const data = await seedAndLogin(page, request, 3);
        const lastCard = page.locator('details.meal-card').last();
        await lastCard.click();
        await expect(lastCard.locator('.detail-item-qty').first()).toContainText('units');
    });

    test('expanded card shows all four macro pills', async ({ page, request }) => {
        await seedAndLogin(page, request, 1);
        const card = page.locator('details.meal-card').first();
        await card.click();
        for (const macro of ['protein', 'carbs', 'fats', 'fibre']) {
            await expect(card.locator('.macro-pill').filter({ hasText: macro })).toBeVisible();
        }
    });

    test('multiple food items in one meal all appear when expanded', async ({ page, request }) => {
        await seedAndLogin(page, request, 1);

        await page.fill('[name="fooditem[]"]', 'chicken');
        await page.fill('[name="quantity[]"]', '50');
        await page.click('button:has-text("+ add item")');
        await page.locator('[name="fooditem[]"]').last().fill('rice');
        await page.locator('[name="quantity[]"]').last().fill('80');
        await page.click('[type="submit"]');
        await page.waitForURL('/home');

        // Newest meal (2 items) is last in chronological order
        const card = page.locator('details.meal-card').last();
        await card.click();
        await expect(card.locator('.detail-item-name')).toHaveCount(2);
        await expect(card.locator('.detail-item-qty')).toHaveCount(2);
    });

    test('each meal card is independent — expanding one does not expand others', async ({ page, request }) => {
        await seedAndLogin(page, request, 3);
        const cards = page.locator('details.meal-card');
        await cards.first().click();
        await expect(cards.first()).toHaveAttribute('open', '');
        await expect(cards.nth(1)).not.toHaveAttribute('open', '');
        await expect(cards.nth(2)).not.toHaveAttribute('open', '');
    });
});
