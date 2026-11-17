import { expect, test } from '@playwright/test';

const password = 'Passw0rd!';

async function login(
  page: import('@playwright/test').Page,
  email: string,
  pass = password,
) {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(pass);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL(/\/feed/);
}

test('register -> login -> create post', async ({ page }) => {
  const email = `e2e-${Date.now()}@test.com`;

  await page.goto('/register');
  await page.getByLabel('昵称').fill('E2E');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(password);
  await page.getByRole('button', { name: '创建账号' }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL(/\/feed/);

  await page.getByRole('link', { name: '写点什么' }).click();
  await expect(page).toHaveURL(/\/posts\/new/);

  await page.getByPlaceholder('一句话说清你要聊什么（可选）').fill('E2E 验收帖');
  await page.getByPlaceholder('发生了什么？你试过什么？现在卡在哪里？').fill(
    '这是 Playwright 从浏览器创建的一条测试帖子。',
  );
  await page.getByRole('button', { name: '发布' }).click();
  await expect(page).toHaveURL(/\/feed/);
});

test('admin can open moderation console', async ({ page }) => {
  await login(page, 'admin@test.com', 'Admin123!ChangeMe');
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: '管理看板' })).toBeVisible();

  await page.getByRole('link', { name: '帖子审核' }).click();
  await expect(page.getByRole('heading', { name: '帖子审核' })).toBeVisible();
});
