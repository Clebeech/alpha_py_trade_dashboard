import { useState } from 'react'
import { LogIn } from 'lucide-react'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    let validUsers = { 'admin': 'admin123' }
    
    try {
      const usersConfig = import.meta.env.VITE_AUTH_USERS
      if (usersConfig) {
        validUsers = JSON.parse(usersConfig)
      }
    } catch (error) {
      console.error('解析用户配置失败，使用默认用户:', error)
    }
    
    if (validUsers[username] && validUsers[username] === password) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('authTime', Date.now().toString())
      localStorage.setItem('currentUser', username)
      onLogin()
    } else {
      setError('用户名或密码错误')
      setPassword('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <LogIn className="login-icon" size={32} />
          <h2>元神资本交易看板</h2>
          <p>请登录以继续</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="请输入用户名"
              autoComplete="username"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            <LogIn size={18} />
            <span>登录</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

