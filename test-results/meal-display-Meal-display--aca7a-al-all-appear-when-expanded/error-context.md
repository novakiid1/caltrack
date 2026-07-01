# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: meal-display.spec.js >> Meal display (mocked DB) >> multiple food items in one meal all appear when expanded
- Location: tests\ui\meal-display.spec.js:72:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[type="submit"]')
    - locator resolved to 3 elements. Proceeding with the first one: <button type="submit" title="remove item" class="del-item-btn" onclick="return confirm('Remove chicken from this meal?')">✕</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]: CalTrack
    - generic [ref=e4]:
      - generic [ref=e5]: Tuesday, Jun 30
      - link "history" [ref=e6] [cursor=pointer]:
        - /url: /history
      - link "settings" [ref=e7] [cursor=pointer]:
        - /url: /settings
      - link "logout" [ref=e8] [cursor=pointer]:
        - /url: /logout
  - main [ref=e9]:
    - generic [ref=e10]: today's summary
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: calories
        - generic [ref=e14]: 2 / 2000 kcal
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: protein
          - generic [ref=e20]: 0.3g / 150g
        - generic [ref=e21]:
          - generic [ref=e22]: carbs
          - generic [ref=e23]: 0g / 250g
        - generic [ref=e24]:
          - generic [ref=e25]: fats
          - generic [ref=e26]: 0.1g / 65g
        - generic [ref=e27]:
          - generic [ref=e28]: fibre
          - generic [ref=e29]: 0g / 30g
    - generic [ref=e30]: today's meals
    - group [ref=e32]:
      - generic "breakfast 08:45 PM 2 kcal ▼" [ref=e33] [cursor=pointer]:
        - generic [ref=e34]:
          - generic [ref=e35]: breakfast
          - generic [ref=e36]: 08:45 PM
        - generic [ref=e37]:
          - generic [ref=e38]: 2 kcal
          - generic [ref=e39]: ▼
    - generic [ref=e40]: add meal
    - generic [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44] [cursor=pointer]: breakfast
        - generic [ref=e45] [cursor=pointer]: lunch
        - generic [ref=e46] [cursor=pointer]: snack
        - generic [ref=e47] [cursor=pointer]: dinner
      - generic [ref=e48]:
        - generic [ref=e49]:
          - textbox "food item" [ref=e50]: chicken
          - spinbutton [ref=e51]: "50"
          - generic [ref=e52]: g
        - generic [ref=e53]:
          - textbox "food item" [ref=e54]: rice
          - spinbutton [active] [ref=e55]: "79"
          - generic [ref=e56]: g
          - button "✕" [ref=e57] [cursor=pointer]
      - generic [ref=e58]:
        - button "+ add item" [ref=e59] [cursor=pointer]
        - button "log meal" [ref=e60] [cursor=pointer]
  - generic [ref=e62] [cursor=pointer]:
    - strong [ref=e64]: rice
    - generic [ref=e65]: g
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | async function seedAndLogin(page, request, count = 3) {
  4  |     const res = await request.post(`/test/seed?count=${count}`);
  5  |     const data = await res.json();
  6  | 
  7  |     await page.goto('/login');
  8  |     await page.fill('[name="email"]', data.email);
  9  |     await page.fill('[name="password"]', data.password);
  10 |     await page.click('[type="submit"]');
  11 |     await page.waitForURL('/home');
  12 | 
  13 |     return data;
  14 | }
  15 | 
  16 | test.describe('Meal display (mocked DB)', () => {
  17 |     test('seeded meals appear as cards', async ({ page, request }) => {
  18 |         await seedAndLogin(page, request, 3);
  19 |         await expect(page.locator('details.meal-card')).toHaveCount(3);
  20 |     });
  21 | 
  22 |     test('all daily meals shown (no cap)', async ({ page, request }) => {
  23 |         await seedAndLogin(page, request, 6);
  24 |         await expect(page.locator('details.meal-card')).toHaveCount(6);
  25 |     });
  26 | 
  27 |     test('most recent meal is last (meals shown in chronological order)', async ({ page, request }) => {
  28 |         const { latestMealtype } = await seedAndLogin(page, request, 3);
  29 |         await expect(page.locator('.mealtype-pill').last()).toContainText(latestMealtype);
  30 |     });
  31 | 
  32 |     test('meal card shows the correct calorie total from DB', async ({ page, request }) => {
  33 |         const { latestCalories } = await seedAndLogin(page, request, 1);
  34 |         const kcalText = await page.locator('.meal-kcal').first().textContent();
  35 |         expect(kcalText).toContain(String(latestCalories));
  36 |     });
  37 | 
  38 |     test('expanded card shows food item name and quantity with correct unit', async ({ page, request }) => {
  39 |         const { latestFoodName, latestFoodUnit, latestFoodDefaultWeight, latestQty } = await seedAndLogin(page, request, 1);
  40 |         const card = page.locator('details.meal-card').first();
  41 |         await card.click();
  42 |         await expect(card.locator('.detail-item-name').first()).toContainText(latestFoodName);
  43 | 
  44 |         let expectedQty;
  45 |         if (latestFoodUnit === 'unit') {
  46 |             const label = latestQty === 1 ? '1 unit' : `${latestQty} units`;
  47 |             expectedQty = latestFoodDefaultWeight ? `${label} (${latestQty * latestFoodDefaultWeight}g)` : label;
  48 |         } else {
  49 |             expectedQty = `${latestQty}${latestFoodUnit}`;
  50 |         }
  51 |         await expect(card.locator('.detail-item-qty').first()).toContainText(expectedQty);
  52 |     });
  53 | 
  54 |     test('unit items (egg) display as "units (Xg)" not raw grams', async ({ page, request }) => {
  55 |         // count=3 → foods cycle: chicken(0), rice(1), egg(2); egg is last
  56 |         await seedAndLogin(page, request, 3);
  57 |         const lastCard = page.locator('details.meal-card').last();
  58 |         await lastCard.click();
  59 |         // egg: qty=2, defaultWeight=50 → "2 units (100g)"
  60 |         await expect(lastCard.locator('.detail-item-qty').first()).toContainText('2 units (100g)');
  61 |     });
  62 | 
  63 |     test('expanded card shows all four macro pills', async ({ page, request }) => {
  64 |         await seedAndLogin(page, request, 1);
  65 |         const card = page.locator('details.meal-card').first();
  66 |         await card.click();
  67 |         for (const macro of ['protein', 'carbs', 'fats', 'fibre']) {
  68 |             await expect(card.locator('.macro-pill').filter({ hasText: macro })).toBeVisible();
  69 |         }
  70 |     });
  71 | 
  72 |     test('multiple food items in one meal all appear when expanded', async ({ page, request }) => {
  73 |         await seedAndLogin(page, request, 1);
  74 | 
  75 |         await page.fill('[name="fooditem[]"]', 'chicken');
  76 |         await page.fill('[name="quantity[]"]', '50');
  77 |         await page.click('button:has-text("+ add item")');
  78 |         await page.locator('[name="fooditem[]"]').last().fill('rice');
  79 |         await page.locator('[name="quantity[]"]').last().fill('80');
> 80 |         await page.click('[type="submit"]');
     |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
  81 |         await page.waitForURL('/home');
  82 | 
  83 |         // Newest meal (2 items) is last in chronological order
  84 |         const card = page.locator('details.meal-card').last();
  85 |         await card.click();
  86 |         await expect(card.locator('.detail-item-name')).toHaveCount(2);
  87 |         await expect(card.locator('.detail-item-qty')).toHaveCount(2);
  88 |     });
  89 | 
  90 |     test('each meal card is independent — expanding one does not expand others', async ({ page, request }) => {
  91 |         await seedAndLogin(page, request, 3);
  92 |         const cards = page.locator('details.meal-card');
  93 |         await cards.first().click();
  94 |         await expect(cards.first()).toHaveAttribute('open', '');
  95 |         await expect(cards.nth(1)).not.toHaveAttribute('open', '');
  96 |         await expect(cards.nth(2)).not.toHaveAttribute('open', '');
  97 |     });
  98 | });
  99 | 
```