import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import BlogForm from '../components/blogForm'

const mockCreateBlog = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BlogForm Component', () => {
  test('user inputs fields correctly', async () => {
    const user = userEvent.setup()

    render(<BlogForm createBlog={mockCreateBlog} />)
    
    const titleInput = screen.getAllByDisplayValue('')[0] 
    const authorInput = screen.getAllByDisplayValue('')[1] 
    const urlInput = screen.getAllByDisplayValue('')[2] 
    const likesInput = screen.getAllByDisplayValue('0')[0] 

    await user.type(titleInput, 'New Blog Title')
    await user.type(authorInput, 'New Author')  
    await user.type(urlInput, 'https://newexample.com')
    await user.type(likesInput, '5')

    expect(titleInput.value).toBe('New Blog Title')
    expect(authorInput.value).toBe('New Author')
    expect(urlInput.value).toBe('https://newexample.com')
    expect(likesInput.value).toBe('5')
  })

  test('form submission calls createBlog with correct data', async () => {
    const user = userEvent.setup()

    render(<BlogForm createBlog={mockCreateBlog} />)
    
    const titleInput = screen.getAllByDisplayValue('')[0] 
    const authorInput = screen.getAllByDisplayValue('')[1] 
    const urlInput = screen.getAllByDisplayValue('')[2] 
    const likesInput = screen.getAllByDisplayValue('0')[0] 

    await user.type(titleInput, 'Test Blog')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://test.com')
    await user.type(likesInput, '3')

    const submitButton = screen.getByText('Add Blog')
    await user.click(submitButton)

    expect(mockCreateBlog).toHaveBeenCalledTimes(1)
    expect(mockCreateBlog).toHaveBeenCalledWith({
      title: 'Test Blog',
      author: 'Test Author', 
      url: 'https://test.com',
      likes: 3
    })
  })

  test('form fields are cleared after submission', async () => {
    const user = userEvent.setup()

    render(<BlogForm createBlog={mockCreateBlog} />)
    
    const titleInput = screen.getAllByDisplayValue('')[0] 
    const authorInput = screen.getAllByDisplayValue('')[1] 
    const urlInput = screen.getAllByDisplayValue('')[2] 

    await user.type(titleInput, 'Test Blog')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://test.com')

    const submitButton = screen.getByText('Add Blog')
    await user.click(submitButton)

    expect(titleInput.value).toBe('')
    expect(authorInput.value).toBe('')
    expect(urlInput.value).toBe('')
  })

  test('form has required validation', () => {
    render(<BlogForm createBlog={mockCreateBlog} />)
    
    const titleInput = screen.getAllByDisplayValue('')[0] 
    const authorInput = screen.getAllByDisplayValue('')[1] 
    const urlInput = screen.getAllByDisplayValue('')[2] 

    expect(titleInput).toBeRequired()
    expect(authorInput).toBeRequired()
    expect(urlInput).toBeRequired()
  })
})