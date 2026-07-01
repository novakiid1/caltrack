# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication >> login with invalid credentials shows error
- Location: tests\ui\auth.spec.js:42:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.error')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.error')

```

```yaml
- text: CalTrack log in to track your meals invalid email or password email
- textbox "email":
  - /placeholder: you@example.com
- text: password
- textbox "password":
  - /placeholder: ••••••••
- button "log in"
- text: no account?
- link "register":
  - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | function uid() {
  4  |     return `test_${Math.random().toString(36).slice(2)}@test.com`;
  5  | }
  6  | 
  7  | test.describe('Authentication', () => {
  8  |     test('register page renders correctly', async ({ page }) => {
  9  |         await page.goto('/register');
  10 |         await expect(page.locator('.logo')).toContainText('CalTrack');
  11 |         await expect(page.locator('[name="name"]')).toBeVisible();
  12 |         await expect(page.locator('[name="email"]')).toBeVisible();
  13 |         await expect(page.locator('[name="password"]')).toBeVisible();
  14 |     });
  15 | 
  16 |     test('register redirects to /setup', async ({ page }) => {
  17 |         await page.goto('/register');
  18 |         await page.fill('[name="name"]', 'Test User');
  19 |         await page.fill('[name="email"]', uid());
  20 |         await page.fill('[name="password"]', 'testpass');
  21 |         await page.click('[type="submit"]');
  22 |         await expect(page).toHaveURL('/setup');
  23 |     });
  24 | 
  25 |     test('duplicate email shows error', async ({ page }) => {
  26 |         const email = uid();
  27 |         await page.goto('/register');
  28 |         await page.fill('[name="name"]', 'A'); await page.fill('[name="email"]', email); await page.fill('[name="password"]', 'pw');
  29 |         await page.click('[type="submit"]');
  30 |         await page.goto('/register');
  31 |         await page.fill('[name="name"]', 'B'); await page.fill('[name="email"]', email); await page.fill('[name="password"]', 'pw');
  32 |         await page.click('[type="submit"]');
  33 |         await expect(page.locator('.error')).toContainText('email already in use');
  34 |     });
  35 | 
  36 |     test('login page renders correctly', async ({ page }) => {
  37 |         await page.goto('/login');
  38 |         await expect(page.locator('[name="email"]')).toBeVisible();
  39 |         await expect(page.locator('[name="password"]')).toBeVisible();
  40 |     });
  41 | 
  42 |     test('login with invalid credentials shows error', async ({ page }) => {
  43 |         await page.goto('/login');
  44 |         await page.fill('[name="email"]', 'nobody@test.com');
  45 |         await page.fill('[name="password"]', 'wrong');
  46 |         await page.click('[type="submit"]');
> 47 |         await expect(page.locator('.error')).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  48 |     });
  49 | 
  50 |     test('logout redirects to /login', async ({ page }) => {
  51 |         const email = uid();
  52 |         await page.goto('/register');
  53 |         await page.fill('[name="name"]', 'Logout User');
  54 |         await page.fill('[name="email"]', email);
  55 |         await page.fill('[name="password"]', 'testpass');
  56 |         await page.click('[type="submit"]');
  57 |         // complete setup
  58 |         await page.fill('[name="calories"]', '2000'); await page.fill('[name="protein"]', '150');
  59 |         await page.fill('[name="carbs"]', '250'); await page.fill('[name="fats"]', '65'); await page.fill('[name="fibre"]', '30');
  60 |         await page.click('[type="submit"]');
  61 |         await page.waitForURL('/home');
  62 |         await page.click('.logout-btn');
  63 |         await expect(page).toHaveURL('/login');
  64 |     });
  65 | });
  66 | 
```