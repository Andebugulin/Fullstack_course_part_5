import React, {useState} from "react"

const BlogItem = ({ blog, updateLikes, deleteBlog, currentUser }) => {
    const [blogVisible, setBlogVisible] = useState(false)

    const toggleVisibility = () => {
        setBlogVisible(!blogVisible)
    }

    return (
    <div className='blog'>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
        border: '1px solid #ddd', 
        padding: '10px', 
        margin: '5px 0',
        borderRadius: '4px'
        }}>
        <h3 className='title'>{blog.title}</h3>
        <p className='author'><strong>Author:</strong> {blog.author}</p>
        <div style={blogVisible ? { display: '' } : { display: 'none' }}>
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
        {currentUser && (currentUser.username === blog.user.username || currentUser.id === blog.user.id) && (
        <button 
            onClick={() => deleteBlog(blog.id, blog.title)}
            style={{ marginLeft: '10px', backgroundColor: '#ff4444', color: 'white' }}
        >
            Delete
        </button>
        )}
        </div>
        </div>
        </div>
        <button onClick={toggleVisibility}>
        {blogVisible ? 'hide' : 'view'}
        </button>
    </div>
    </div>
)}

export default BlogItem