import React, { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
    likes: 0
  })
  

  const addBlog = async (event) => {
    event.preventDefault()
    try {
      console.log('Adding new blog:', newBlog)
      createBlog(newBlog)
      setNewBlog({ title: '', author: '', url: '', likes: 0 })
    } catch (error) {
      console.error('Add blog error:', error)
    }
  }
  
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewBlog({
      ...newBlog,
      [name]: name === 'likes' ? Number(value) : value
    })
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h3>Add New Blog</h3>
      <form onSubmit={addBlog}>
        <div style={{ margin: '5px 0' }}>
          <label>Title: </label>
          <input
            data-testid="title"
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
            data-testid="author"
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
            data-testid="url"
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
            data-testid="likes"
            type="number"
            name="likes"
            value={newBlog.likes}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        <button type="submit">Add Blog</button>
      </form>
    </div>
  )
}
  
export default BlogForm