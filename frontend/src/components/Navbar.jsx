import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api'

function Navbar() {
  const { user, token, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

useEffect(() => {
  if (!user) return
  const fetchUnread = () => {
    api.get('/api/chat/unread-count', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUnreadCount(res.data.unread_count)).catch(() => {})
  }
  fetchUnread()
  const interval = setInterval(fetchUnread, 5000)
  return () => clearInterval(interval)
}, [user])

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-building-store"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21l18 0" /><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" /><path d="M5 21l0 -10.15" /><path d="M19 21l0 -10.15" /><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" /></svg>
        <div>
          <div style={styles.logoText}>One Big Hub</div>
          <div style={styles.logoSub}>Buy · Sell · Trade · Rent</div>
        </div>
      </Link>

      {user && (
        <input
          type="text"
          placeholder="Search items, categories..."
          style={styles.search}
          onKeyDown={e => {
            if (e.key === 'Enter') navigate(`/?search=${e.target.value}`)
          }}
        />
      )}

      <div style={styles.right}>
        {user ? (
          <>
            <Link to="/profile" style={styles.navLink}>My Profile</Link>
            <Link to="/saved" style={styles.navLink}>Likes</Link>
            <Link to="/chat" style={{ ...styles.navLink, position: 'relative' }}>Chat{unreadCount > 0 && (<span style={styles.badge}>{unreadCount}</span>)}</Link>
            <Link to="/post" style={styles.postBtn}>Post listing</Link>
            <div style={styles.avatar} onClick={() => navigate('/profile')}>
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
        </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register" style={styles.postBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '10px',
    color: '#888',
  },
  search: {
    flex: 1,
    maxWidth: '420px',
    padding: '8px 16px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    fontSize: '13px',
    outline: 'none',
    background: '#f5f5f5',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  navLink: {
    fontSize: '13px',
    color: '#444',
    textDecoration: 'none',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  postBtn: {
    padding: '8px 18px',
    background: '#1A73E8',
    color: 'white',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    background: '#e53e3e',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '99px',
    padding: '1px 6px',
    minWidth: '16px',
    textAlign: 'center',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    flexShrink: 0,
  }
}

export default Navbar