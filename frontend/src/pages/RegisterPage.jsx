import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'


function RegisterPage() {
  const navigate = useNavigate()
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  if (!form.email.endsWith('@gbox.adnu.edu.ph'))
    return setError('Only @gbox.adnu.edu.ph emails are allowed')
  if (form.password !== form.confirmPassword)
    return setError('Passwords do not match')
  setLoading(true)
  try {
  
    await api.post('/api/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password,
      department: form.department
    })

    
    if (avatarFile) {
      const loginRes = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })
      const token = loginRes.data.token

      const formData = new FormData()
      formData.append('photo', avatarFile)
      await api.post('/api/auth/profile/photo', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
    }

    navigate('/login')
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            {<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-building-store"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21l18 0" /><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" /><path d="M5 21l0 -10.15" /><path d="M19 21l0 -10.15" /><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" /></svg>}
          </div>
          <div style={styles.logoText}>One Big Hub</div>
          <div style={styles.logoSub}>Buy · Sell · Trade · Rent</div>
        </div>
      </div>
      <div style={styles.right}>
        <div
  style={styles.avatarCircle}
  onClick={() => document.getElementById('avatarInput').click()}
  title="Upload profile photo"
>
  {avatarPreview ? (
    <img src={avatarPreview} alt="avatar" style={styles.avatarImg} />
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )}
  <input
    id="avatarInput"
    type="file"
    accept="image/*"
    style={{ display: 'none' }}
   onChange={e => {
  const file = e.target.files[0]
  if (file) {
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarFile(file)
  }
}}
  />
</div>
<div style={styles.uploadHint}>Upload profile photo (optional)</div>
        <h2 style={styles.title}>Create account</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input
              type="text"
              name="name"
              placeholder="First name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Last name"
              style={styles.input}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="School email (@gbox.adnu.edu.ph)"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <div style={styles.row}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <input
            type="text"
            name="department"
            placeholder="Course & Year"
            value={form.department}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  left: {
    flex: 1,
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: { textAlign: 'center' },
  logoCircle: { fontSize: '48px', marginBottom: '12px' },
  logoText: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' },
  logoSub: { fontSize: '13px', color: '#888' },
  right: {
    width: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: 'white',
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#f0f0f0',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    border: '2px dashed #ccc',
  },
avatarImg: {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '50%',
},
uploadHint: {
  fontSize: '11px',
  color: '#aaa',
  marginBottom: '16px',
},
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '20px',
    alignSelf: 'flex-start',
  },
  error: {
    background: '#fff0f0',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  row: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '11px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '13px',
    outline: 'none',
    background: '#f9f9f9',
  },
  btn: {
    padding: '11px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  footer: {
    marginTop: '16px',
    fontSize: '13px',
    color: '#666',
  },
  link: {
    color: '#1A73E8',
    fontWeight: '500',
    textDecoration: 'none',
  }
}

export default RegisterPage