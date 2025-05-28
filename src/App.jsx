import React, { useState, useEffect } from 'react'
import loginService from './services/login' 
import blogService from './services/blog'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
    likes: 0
  })
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [filterAuthor, setFilterAuthor] = useState('')
  
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Check for existing user token on mount
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  // Fetch blogs when user is logged in
  useEffect(() => {
    if (user) {
      fetchBlogs()
    }
  }, [user])

  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, 
        password
      })

      window.localStorage.setItem('loggedBlogUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification('Login successful!')
    }
    catch (error) {
      console.error('Login error:', error)
      setNotification('Invalid username or password')
      setTimeout(() => {
        setNotification('')
      }, 3000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogUser')
    setUser(null)
    blogService.setToken(null)
    setBlogs([])
    showNotification('Logged out successfully')
  }

  const fetchBlogs = async () => {
    try {
      const blogsData = await blogService.getAll()
      setBlogs(blogsData)
    } catch (error) {
      console.error('Fetch blogs error:', error)
      showNotification('Error fetching blogs')
    }
  }

  const addBlog = async (event) => {
    event.preventDefault()
    try {
      const blogData = await blogService.create(newBlog)
      setBlogs(blogs.concat(blogData))
      setNewBlog({ title: '', author: '', url: '', likes: 0 })
      setShowForm(false)
      showNotification(`Added blog: ${blogData.title}`)
    } catch (error) {
      console.error('Add blog error:', error)
      showNotification('Error adding blog')
    }
  }

  // Update blog likes - you'll need to add this to your blog service
  const updateLikes = async (id, currentLikes) => {
    try {
      const updatedBlog = { likes: currentLikes + 1 }
      const response = await blogService.update(id, updatedBlog)
      setBlogs(blogs.map(blog => blog.id === id ? response : blog))
      showNotification('Liked!')
    } catch (error) {
      console.error('Update likes error:', error)
      showNotification('Like feature not yet implemented in backend')
    }
  }

  // Delete blog - you'll need to add this to your blog service
  const deleteBlog = async (id, title) => {
    if (window.confirm(`Delete blog: ${title}?`)) {
      try {
        // You'll need to add a delete method to your blog service
        await blogService.delete(id)
        setBlogs(blogs.filter(blog => blog.id !== id))
        showNotification(`Deleted blog: ${title}`)
      } catch (error) {
        console.error('Delete blog error:', error)
        showNotification('Delete feature not yet implemented in backend')
      }
    }
  }

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewBlog({
      ...newBlog,
      [name]: name === 'likes' ? Number(value) : value
    })
  }

  // Filter and sort blogs
  const filteredAndSortedBlogs = blogs
    .filter(blog => 
      filterAuthor === '' || 
      blog.author.toLowerCase().includes(filterAuthor.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return (b.likes || 0) - (a.likes || 0)
        case 'author':
          return (a.author || '').localeCompare(b.author || '')
        default:
          return (a.title || '').localeCompare(b.title || '')
      }
    })

  const loginForm = () => (
    <div>
      <h2>Login to Blog App</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const BlogForm = () => (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h3>Add New Blog</h3>
      <form onSubmit={addBlog}>
        <div style={{ margin: '5px 0' }}>
          <label>Title: </label>
          <input
            type="text"
            name="title"
            value={newBlog.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div style={{ margin: '5px 0' }}>
          <label>Author: </label>
          <input
            type="text"
            name="author"
            value={newBlog.author}
            onChange={handleInputChange}
            required
          />
        </div>
        <div style={{ margin: '5px 0' }}>
          <label>URL: </label>
          <input
            type="url"
            name="url"
            value={newBlog.url}
            onChange={handleInputChange}
            required
          />
        </div>
        <div style={{ margin: '5px 0' }}>
          <label>Likes: </label>
          <input
            type="number"
            name="likes"
            value={newBlog.likes}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        <button type="submit">Add Blog</button>
        <button type="button" onClick={() => setShowForm(false)}>
          Cancel
        </button>
      </form>
    </div>
  )

  const BlogItem = ({ blog }) => (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '10px', 
      margin: '5px 0',
      borderRadius: '4px'
    }}>
      <h3>{blog.title}</h3>
      <p><strong>Author:</strong> {blog.author}</p>
      <p>
        <strong>URL:</strong> 
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </p>
      <p><strong>Likes:</strong> {blog.likes || 0}</p>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => updateLikes(blog.id, blog.likes || 0)}>
          👍 Like
        </button>
        <button 
          onClick={() => deleteBlog(blog.id, blog.title)}
          style={{ marginLeft: '10px', backgroundColor: '#ff4444', color: 'white' }}
        >
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {user === null ? (
        loginForm()
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p>{user.name} logged-in</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
          
          <h1>Blog List</h1>
          
          {notification && (
            <div style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#dff0d8',
              border: '1px solid #d6e9c6',
              borderRadius: '4px',
              color: '#3c763d'
            }}>
              {notification}
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Hide Form' : 'Add New Blog'}
            </button>
          </div>

          {showForm && <BlogForm />}

          <div style={{ margin: '20px 0' }}>
            <div style={{ margin: '10px 0' }}>
              <label>Sort by: </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="likes">Likes</option>
              </select>
            </div>
            
            <div style={{ margin: '10px 0' }}>
              <label>Filter by author: </label>
              <input
                type="text"
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                placeholder="Enter author name..."
              />
            </div>
          </div>

          <h2>Blogs ({filteredAndSortedBlogs.length})</h2>
          
          {filteredAndSortedBlogs.length === 0 ? (
            <p>No blogs found. Add some blogs!</p>
          ) : (
            filteredAndSortedBlogs.map(blog => (
              <BlogItem key={blog.id} blog={blog} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App