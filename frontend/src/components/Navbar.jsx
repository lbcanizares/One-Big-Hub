import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoIcon}>🏪</div>
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
            <Link to="/chat" style={styles.navLink}>Chat</Link>
            <Link to="/post" style={styles.postBtn}>Post listing</Link>
            <div style={styles.avatar} onClick={handleLogout} title="Logout">
              {user.name.charAt(0).toUpperCase()}
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
  logoIcon: { fontSize: '26px' },
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