# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.pom.spec.js >> Auth page object example >> login shows an error for bad credentials
- Location: tests\ui\auth.pom.spec.js:38:5

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
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | class AuthPage {
  4  |     constructor(page) {
  5  |         this.page = page;
  6  |     }
  7  | 
  8  |     async openRegister() {
  9  |         await this.page.goto('/register');
  10 |     }
  11 | 
  12 |     async register(name, email, password) {
  13 |         await this.openRegister();
  14 |         await this.page.fill('[name="name"]', name);
  15 |         await this.page.fill('[name="email"]', email);
  16 |         await this.page.fill('[name="password"]', password);
  17 |         await this.page.click('[type="submit"]');
  18 |     }
  19 | 
  20 |     async login(email, password) {
  21 |         await this.page.goto('/login');
  22 |         await this.page.fill('[name="email"]', email);
  23 |         await this.page.fill('[name="password"]', password);
  24 |         await this.page.click('[type="submit"]');
  25 |     }
  26 | }
  27 | 
  28 | test.describe('Auth page object example', () => {
  29 |     test('register flow works', async ({ page }) => {
  30 |         const authPage = new AuthPage(page);
  31 |         const email = `pom_${Date.now()}@test.com`;
  32 | 
  33 |         await authPage.register('Page Object User', email, 'testpass');
  34 | 
  35 |         await expect(page).toHaveURL(/\/setup$/);
  36 |     });
  37 | 
  38 |     test('login shows an error for bad credentials', async ({ page }) => {
  39 |         const authPage = new AuthPage(page);
  40 | 
  41 |         await authPage.login('missing@test.com', 'wrong');
  42 | 
> 43 |         await expect(page.locator('.error')).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  44 |     });
  45 | });
  46 | 
```