import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function EditProfilePage() {
  const { user, token, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    bio: ''
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_photo || null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

const handleAvatar = async (e) => {
  const file = e.target.files[0]
  if (file) {
    setAvatarPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await api.post(
        '/api/auth/profile/photo',
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      login({ ...user, profile_photo: res.data.profile_photo }, token)
    } catch (err) {
      console.error(err)
    }
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  setSuccess('')
  try {
    const res = await api.put('/api/auth/profile',
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    login(res.data.user, token)
    setSuccess('Profile updated successfully!')
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update profile')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.card}>
          <h2 style={styles.title}>Edit profile</h2>

          {success && <div style={styles.success}>{success}</div>}
          {error && <div style={styles.error}>{error}</div>}

          {/* Profile photo */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Profile photo</div>
            <div style={styles.photoRow}>
              <div style={styles.avatarWrap}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={styles.photoInfo}>
                <p style={styles.photoHint}>
                  Clear frontal face photos are an important way for buyers and sellers to learn about each other.
                </p>
                <button
                  style={styles.uploadBtn}
                  onClick={() => document.getElementById('avatarInput').click()}
                >
                  Upload a photo
                </button>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatar}
                />
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Account details */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Account details</div>
            <div style={styles.sectionSub}>👁 This info appears on your public profile</div>
            <div style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Display name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Course & Year</label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. BSCS 3"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  maxLength={255}
                />
                <div style={styles.charCount}>{form.bio.length}/255</div>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Private details */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Private details</div>
            <div style={styles.sectionSub}>🔒 Only you can see this</div>
            <div style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="yourname@gbox.adnu.edu.ph"
                />
                <div style={styles.fieldHint}>Must be a @gbox.adnu.edu.ph email</div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Contact number</label>
                <input
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 09123456789"
                />
                <div style={styles.fieldHint}>
                  This will be shown to buyers when you post a listing so they can contact you directly
                </div>
              </div>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button onClick={() => navigate('/profile')} style={styles.cancelBtn}>Cancel</button>
            <button onClick={handleSubmit} style={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  body: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  card: {
    background: 'white', borderRadius: '12px', padding: '32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '24px' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' },
  sectionSub: { fontSize: '12px', color: '#888', marginBottom: '16px' },
  photoRow: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatarWrap: {
    width: '90px', height: '90px', borderRadius: '50%',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: '90px', height: '90px', borderRadius: '50%',
    background: '#1A73E8', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', fontWeight: '700',
  },
  photoInfo: { flex: 1 },
  photoHint: { fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: 1.5 },
  uploadBtn: {
    padding: '8px 18px', borderRadius: '8px',
    border: '1px solid #1A73E8', background: 'white',
    color: '#1A73E8', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  divider: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#444' },
  input: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', outline: 'none',
    background: '#fafafa',
  },
  textarea: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit', background: '#fafafa',
  },
  charCount: { fontSize: '11px', color: '#aaa', textAlign: 'right' },
  fieldHint: { fontSize: '11px', color: '#aaa' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  cancelBtn: {
    padding: '10px 24px', borderRadius: '8px',
    border: '1px solid #ddd', background: 'white',
    fontSize: '14px', color: '#555', cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 28px', borderRadius: '8px',
    border: 'none', background: '#1A73E8',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  success: {
    background: '#f0fff4', color: '#276749', padding: '10px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  error: {
    background: '#fff0f0', color: '#e53e3e', padding: '10px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
}

export default EditProfilePage