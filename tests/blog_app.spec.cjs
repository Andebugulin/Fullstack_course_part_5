const { test, describe, expect, beforeEach } = require('@playwright/test')
const {loginWith, createBlog} = require('./helper')

describe('blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'New User',
        username: 'newuser',
        password: 'securepassword'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'New User 2',
        username: 'newuser2',
        password: 'securepassword'
      }
    })
    await page.goto('http://localhost:5173')
  }
  )

  test('login form can be opened', async ({ page }) => {
    await loginWith(page, 'newuser', 'securepassword')
    await expect(page.getByText('New User logged-in')).toBeVisible()
  })
  
  describe('login form is shown', () => {
    test('login form is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    })

    test('successfully logs in with valid credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByTestId('username').fill('newuser')
      await page.getByTestId('password').fill('securepassword')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('New User logged-in')).toBeVisible()
    })

    test('fails to log in with invalid credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByTestId('username').fill('wronguser')
      await page.getByTestId('password').fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('Invalid username or password')).toBeVisible()
    })
  })
  
  describe('when logged in', () => {
    beforeEach(async ({ page }) => loginWith(page, 'newuser', 'securepassword')
  ) 
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test Blog', 'Test Author', 'http://testblog.com', 5)
    })
    
    test('a blog can be deleted by the creator', async ({ page }) => {
      await createBlog(page, 'Test Blog 1', 'Test Author', 'http://testblog.com', 5)
      await page.getByRole('button', { name: 'view' }).last().click()
    
      // Handle the confirmation dialog
      await page.on('dialog', async (dialog) => {
        await dialog.accept()
      })
    
      await page.getByRole('button', { name: 'Delete' }).click()
      await expect(page.getByRole('button', { name: 'view' }).last()).not.toBeVisible()
    })
    
    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Test Blog', 'Test Author', 'http://testblog.com', 5)
      await page.getByRole('button', { name: 'view' }).first().click()
      await page.getByRole('button', { name: '👍 Like' }).click()
      await expect(page.getByText('Likes: 6')).toBeVisible()
    })

    test('only create sees delete button', async ({ page }) => {
      await createBlog(page, 'Test Blog', 'Test Author', 'http://testblog.com', 5)
      await page.getByRole('button', { name: 'view' }).last().click()
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
      
      // Log in as another user
      await page.getByRole('button', { name: 'Logout' }).click()
      await loginWith(page, 'newuser2', 'securepassword')
      
      // Check that the delete button is not visible
      await page.getByRole('button', { name: 'view' }).last().click()
      await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
    })

    test('blogs are ordered by likes', async ({ page }) => {
      await createBlog(page, 'Blog A', 'Author A', 'http://blogA.com', 3)
      await createBlog(page, 'Blog B', 'Author B', 'http://blogB.com', 5)
      await createBlog(page, 'Blog C', 'Author C', 'http://blogC.com', 2)

      await page.selectOption('select', 'likes')

      await expect(page.getByRole('button', { name: 'view' })).toHaveCount(3)

      const blogs = page.locator('.blog')
      const titles = await blogs.locator('.title').allTextContents()

      // Check if the blogs are ordered by likes
      expect(titles).toEqual(['Blog B', 'Blog A', 'Blog C'])
    })
  })
})
  