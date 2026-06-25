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
        🏪 One Big Hub
      </Link>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.welcome}>Hi, {user.name.split(' ')[0]}!</span>
            <Link to="/" style={styles.link}>Browse</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    backgroundColor: '#534AB7',
    color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    color: 'white',
    fontSize: '14px',
  },
  welcome: {
    fontSize: '14px',
    color: '#e0deff',
  },
  logoutBtn: {
    background: 'white',
    color: '#534AB7',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: '500',
  }
}

export default Navbar