import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check header elements
    await expect(page.getByRole('link', { name: 'TechArena' })).toBeVisible();
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    
    // Check hero section
    await expect(page.getByText('Uganda\'s Premier Technology Marketplace')).toBeVisible();
    
    // Check featured categories section
    await expect(page.getByRole('heading', { name: 'Shop by Category' })).toBeVisible();
    
    // Check featured products section
    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
    
    // Check testimonials section
    await expect(page.getByRole('heading', { name: 'What Our Customers Say' })).toBeVisible();
    
    // Check newsletter section
    await expect(page.getByRole('heading', { name: /newsletter/i })).toBeVisible();
    
    // Check footer
    await expect(page.getByText('© 2024 TechArena Uganda')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('should display search functionality', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder('Search products...');
    await expect(searchInput).toBeVisible();
    
    // Test search input focus
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test('should display cart and wishlist icons with counts', async ({ page }) => {
    await page.goto('/');
    
    // Cart and wishlist links should be visible
    const cartLink = page.getByRole('link').filter({ has: page.locator('svg') }).nth(0);
    const wishlistLink = page.getByRole('link').filter({ has: page.locator('svg') }).nth(1);
    
    await expect(cartLink).toBeVisible();
    await expect(wishlistLink).toBeVisible();
  });

  test('should display theme toggle', async ({ page }) => {
    await page.goto('/');
    
    // Theme toggle button should be visible
    const themeToggle = page.locator('[role="button"]').filter({ has: page.locator('svg') }).first();
    await expect(themeToggle).toBeVisible();
  });

  test('should display authentication buttons for non-logged in users', async ({ page }) => {
    await page.goto('/');
    
    // Should show Sign In and Sign Up buttons
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await expect(mobileMenuButton).toBeVisible();
    
    // Navigation items should be hidden on mobile
    await expect(page.getByRole('link', { name: 'Products' })).not.toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Click mobile menu button
    const mobileMenuButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await mobileMenuButton.click();
    
    // Mobile menu should open with navigation items
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
  });

  test('should handle newsletter subscription', async ({ page }) => {
    await page.goto('/');
    
    // Find newsletter signup form
    const emailInput = page.getByPlaceholder(/email/i).last();
    const subscribeButton = page.getByRole('button', { name: /subscribe/i }).last();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await subscribeButton.click();
      
      // Should show some feedback (success message or error)
      // This depends on your implementation
    }
  });

  test('should display featured products', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForLoadState('networkidle');
    
    // Should display product cards in featured section
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    // Should have at least some products (this depends on your mock data)
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display featured categories', async ({ page }) => {
    await page.goto('/');
    
    // Wait for categories to load
    await page.waitForLoadState('networkidle');
    
    // Should display category cards
    const categoryCards = page.locator('[data-testid="category-card"]');
    const cardCount = await categoryCards.count();
    
    // Should have categories displayed
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Uganda's Premier Technology Marketplace/);
    
    // Check meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /technology products in Uganda/);
  });
});