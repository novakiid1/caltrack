# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> Home page >> meal card shows mealtype as title
- Location: tests\ui\home.spec.js:74:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.meal-name').first()
Expected substring: "dinner"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.meal-name').first()

```

```yaml
- banner:
  - text: CalTrack Sunday, Jul 5
  - link "history":
    - /url: /history
  - link "settings":
    - /url: /settings
  - link "logout":
    - /url: /logout
- main:
  - text: today's summary calories 2 / 2000 kcal protein 0.3g / 150g carbs 0g / 250g fats 0.1g / 65g fibre 0g / 30g today's meals
  - group: dinner 11:47 AM 2 kcal ▼
  - text: add meal breakfast lunch snack dinner
  - textbox "food item"
  - spinbutton
  - text: g
  - button "+ add item"
  - button "log meal"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | function uid() {
  4  |     return `test_${Math.random().toString(36).slice(2)}@test.com`;
  5  | }
  6  | 
  7  | async function registerAndSetup(page) {
  8  |     await page.goto('/register');
  9  |     await page.fill('[name="name"]', 'Home User');
  10 |     await page.fill('[name="email"]', uid());
  11 |     await page.fill('[name="password"]', 'testpass');
  12 |     await page.click('[type="submit"]');
  13 |     await page.waitForURL('/setup');
  14 |     await page.fill('[name="calories"]', '2000');
  15 |     await page.fill('[name="protein"]', '150');
  16 |     await page.fill('[name="carbs"]', '250');
  17 |     await page.fill('[name="fats"]', '65');
  18 |     await page.fill('[name="fibre"]', '30');
  19 |     await page.click('[type="submit"]');
  20 |     await page.waitForURL('/home');
  21 | }
  22 | 
  23 | test.describe('Home page', () => {
  24 |     test('shows CalTrack header and logout button', async ({ page }) => {
  25 |         await registerAndSetup(page);
  26 |         await expect(page.locator('.logo')).toContainText('CalTrack');
  27 |         await expect(page.locator('.logout-btn')).toBeVisible();
  28 |     });
  29 | 
  30 |     test('shows empty state when no meals logged', async ({ page }) => {
  31 |         await registerAndSetup(page);
  32 |         await expect(page.locator('.empty-state')).toBeVisible();
  33 |     });
  34 | 
  35 |     test('meal type radio options are present', async ({ page }) => {
  36 |         await registerAndSetup(page);
  37 |         for (const type of ['breakfast', 'lunch', 'snack', 'dinner']) {
  38 |             await expect(page.locator(`[value="${type}"]`)).toBeAttached();
  39 |         }
  40 |     });
  41 | 
  42 |     test('breakfast is selected by default', async ({ page }) => {
  43 |         await registerAndSetup(page);
  44 |         await expect(page.locator('#breakfast')).toBeChecked();
  45 |     });
  46 | 
  47 |     test('add item button appends a new row', async ({ page }) => {
  48 |         await registerAndSetup(page);
  49 |         const before = await page.locator('.item-row').count();
  50 |         await page.click('button:has-text("+ add item")');
  51 |         expect(await page.locator('.item-row').count()).toBe(before + 1);
  52 |     });
  53 | 
  54 |     test('remove button on extra row deletes that row', async ({ page }) => {
  55 |         await registerAndSetup(page);
  56 |         await page.click('button:has-text("+ add item")');
  57 |         const before = await page.locator('.item-row').count();
  58 |         await page.locator('.btn-danger').first().click();
  59 |         expect(await page.locator('.item-row').count()).toBe(before - 1);
  60 |     });
  61 | 
  62 |     test('meal card expands to show macros', async ({ page }) => {
  63 |         await registerAndSetup(page);
  64 |         // add a meal
  65 |         await page.fill('[name="fooditem[]"]', 'chicken');
  66 |         await page.fill('[name="quantity[]"]', '100');
  67 |         await page.click('[type="submit"]');
  68 |         await page.waitForURL('/home');
  69 |         // expand the details element
  70 |         await page.locator('details.meal-card').first().click();
  71 |         await expect(page.locator('.macro-row')).toBeVisible();
  72 |     });
  73 | 
  74 |     test('meal card shows mealtype as title', async ({ page }) => {
  75 |         await registerAndSetup(page);
  76 |         await page.locator('label[for="dinner"]').click();
  77 |         await page.fill('[name="fooditem[]"]', 'chicken');
  78 |         await page.fill('[name="quantity[]"]', '100');
  79 |         await page.click('[type="submit"]');
  80 |         await page.waitForURL('/home');
> 81 |         await expect(page.locator('.meal-name').first()).toContainText('dinner');
     |                                                          ^ Error: expect(locator).toContainText(expected) failed
  82 |     });
  83 | 
  84 |     test('unauthenticated /home redirects to /login', async ({ page }) => {
  85 |         await page.goto('/home');
  86 |         await expect(page).toHaveURL('/login');
  87 |     });
  88 | });
  89 | 
```