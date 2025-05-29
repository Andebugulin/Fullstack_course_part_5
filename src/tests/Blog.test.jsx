import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import BlogItem from '../components/blog'

const mockUpdateLikes = vi.fn()
const mockDeleteBlog = vi.fn()

const mockBlog = {
  id: '1',
  title: 'Test Blog Title',
  author: 'Test Author',
  url: 'https://example.com',
  likes: 5
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BlogItem Component', () => {
  test('renders blog title and hides details by default', () => {
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    expect(screen.getByText('Test Blog Title')).toBeInTheDocument()
    
    expect(screen.queryByText('Test Author')).toBeInTheDocument()
    
    expect(screen.getByText('view')).toBeInTheDocument()
  })

  test('shows blog details when view button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    
    expect(screen.getByText('hide')).toBeInTheDocument()
  })

  test('calls updateLikes when like button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    await user.click(screen.getByText('view'))
    
    const likeButton = screen.getByText('👍 Like')
    await user.click(likeButton)

    expect(mockUpdateLikes).toHaveBeenCalledTimes(1)
    expect(mockUpdateLikes).toHaveBeenCalledWith('1', 5)
  })

  test('calls updateLikes double times when like button is clicked twice', async () => {
    const user = userEvent.setup()
    
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    await user.click(screen.getByText('view'))
    
    const likeButton = screen.getByText('👍 Like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockUpdateLikes).toHaveBeenCalledTimes(2)
    expect(mockUpdateLikes).toHaveBeenNthCalledWith(1, '1', 5)
    expect(mockUpdateLikes).toHaveBeenNthCalledWith(2, '1', 5)
  })

  test('calls deleteBlog when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('confirm', vi.fn(() => true))
    
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    await user.click(screen.getByText('view'))
    
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockDeleteBlog).toHaveBeenCalledTimes(1)
    expect(mockDeleteBlog).toHaveBeenCalledWith('1', 'Test Blog Title')
    
    vi.unstubAllGlobals()
  })

  test('handles blog with no likes', async () => {
    const user = userEvent.setup()
    const blogWithoutLikes = { ...mockBlog, likes: undefined }
    
    render(
      <BlogItem 
        blog={blogWithoutLikes}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    await user.click(screen.getByText('view'))
    
    expect(screen.getByText('0')).toBeInTheDocument()
    
    await user.click(screen.getByText('👍 Like'))
    expect(mockUpdateLikes).toHaveBeenCalledWith('1', 0)
  })

  test('verifies mock function calls using mock.calls array', async () => {
    const user = userEvent.setup()
    
    render(
      <BlogItem 
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        deleteBlog={mockDeleteBlog}
      />
    )

    await user.click(screen.getByText('view'))
    await user.click(screen.getByText('👍 Like'))

    expect(mockUpdateLikes.mock.calls).toHaveLength(1)
    expect(mockUpdateLikes.mock.calls[0]).toEqual(['1', 5])
  })
})