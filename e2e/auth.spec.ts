import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
  });

  test('should display register page correctly', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Phone Number')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });

  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should show validation errors on register form', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await expect(page.getByText('First name must be at least 2 characters')).toBeVisible();
    await expect(page.getByText('Last name must be at least 2 characters')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click on Sign up link
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    
    // Click on Sign in link
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // Should have callback URL parameter
    const url = page.url();
    expect(url).toContain('callbackUrl');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Enter invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Enter short password
    await page.getByLabel('Password').fill('123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should validate password confirmation on register', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Fill form with mismatched passwords
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Phone Number').fill('+256700123456');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('different-password');
    
    // Accept terms
    await page.getByRole('checkbox').check();
    
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('should require terms acceptance on register', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Fill form without accepting terms
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Phone Number').fill('+256700123456');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    
    // Button should be disabled
    await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled();
  });
});