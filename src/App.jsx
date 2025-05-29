import React, { useState, useEffect, useRef } from 'react'
import loginService from './services/login' 
import blogService from './services/blog'
import LoginForm from './components/loginForm'
import Togglable from './components/toggle'
import BlogForm from './components/blogForm' 
import BlogItem from './components/blog'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notification, setNotification] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [filterAuthor, setFilterAuthor] = useState('')

  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const blogFormRef = useRef()

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

  const addBlog = async (blogObject) => {
    try {
      console.log('Adding blog:', blogObject)
      const blogData = await blogService.create(blogObject)
      blogFormRef.current.toggleVisibility()
      setBlogs(blogs.concat(blogData))
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



  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {user === null ? (
        <Togglable buttonLabel='login'>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
       </Togglable>
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

          <Togglable buttonLabel="new blog" ref={blogFormRef}>
              <BlogForm
              createBlog={addBlog}
            />
          </Togglable>

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
              <BlogItem key={blog.id} blog={blog} updateLikes={updateLikes} deleteBlog={deleteBlog}/>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App