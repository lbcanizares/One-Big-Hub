import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function PostListingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    transaction_type: 'sell',
    price: '',
    rent_duration: '',
    trade_for: '',
    meetup_location: '',
    condition: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const categories = ['Books & Notes', 'Electronics', 'Uniforms', 'Food', 'Dorm Stuff', 'Services', 'Others']
  const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/listings/', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (photo) {
        const formData = new FormData()
        formData.append('photo', photo)
        await axios.post(
          `http://127.0.0.1:5000/api/listings/${res.data.id}/photos`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        )
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.container}>

          {/* Left - Photos */}
          <div style={styles.photoSection}>
            <div style={styles.sectionLabel}>Photos</div>
            <div
              style={styles.mainUpload}
              onClick={() => document.getElementById('photoInput').click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" style={styles.previewImg} />
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <div style={styles.uploadIcon}>📷</div>
                  <div style={styles.uploadText}>Click to upload photo</div>
                </div>
              )}
            </div>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
            <div style={styles.thumbRow}>
              {['+', '+', '+', '+'].map((p, i) => (
                <div key={i} style={styles.thumbBox}>{p}</div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <div style={styles.formSection}>
            <div style={styles.sectionLabel}>Listing details</div>
            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="What are you listing?"
                  value={form.title}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Listing type</label>
                <div style={styles.typeRow}>
                  {['sell', 'rent', 'trade', 'free'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, transaction_type: t })}
                      style={{
                        ...styles.typeBtn,
                        ...(form.transaction_type === t ? styles.typeBtnActive : {})
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Price (₱)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} style={styles.input} required>
                    <option value="">Select category ▾</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Condition</label>
                  <select name="condition" value={form.condition} onChange={handleChange} style={styles.input}>
                    <option value="">Select condition ▾</option>
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {form.transaction_type === 'rent' && (
                <div style={styles.field}>
                  <label style={styles.label}>Rent Duration</label>
                  <input
                    type="text"
                    name="rent_duration"
                    placeholder="e.g. 1 day, 1 week"
                    value={form.rent_duration}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              )}

              {form.transaction_type === 'trade' && (
                <div style={styles.field}>
                  <label style={styles.label}>Looking to trade for</label>
                  <input
                    type="text"
                    name="trade_for"
                    placeholder="e.g. Calculator, Lab gown"
                    value={form.trade_for}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the item, condition, terms..."
                  value={form.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows={4}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Meet-up location</label>
                <input
                  type="text"
                  name="meetup_location"
                  placeholder="e.g. Library, Cafeteria, Gate 1"
                  value={form.meetup_location}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.btnRow}>
                <button type="button" onClick={() => navigate('/')} style={styles.draftBtn}>
                  Save as draft
                </button>
                <button type="submit" style={styles.publishBtn} disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  container: {
    display: 'flex', gap: '28px', background: 'white',
    borderRadius: '12px', padding: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  photoSection: { width: '280px', flexShrink: 0 },
  sectionLabel: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' },
  mainUpload: {
    height: '180px', background: '#f0f0f0', borderRadius: '10px',
    marginBottom: '10px', cursor: 'pointer', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px dashed #ccc',
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  uploadPlaceholder: { textAlign: 'center' },
  uploadIcon: { fontSize: '28px', marginBottom: '6px' },
  uploadText: { fontSize: '12px', color: '#aaa' },
  thumbRow: { display: 'flex', gap: '8px' },
  thumbBox: {
    flex: 1, height: '50px', background: '#f0f0f0', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', color: '#bbb', cursor: 'pointer', border: '1px dashed #ccc',
  },
  formSection: { flex: 1 },
  error: {
    background: '#fff0f0', color: '#e53e3e',
    padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', gap: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '12px', fontWeight: '600', color: '#444' },
  input: {
    padding: '9px 12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '13px', outline: 'none',
    background: '#fafafa', width: '100%', boxSizing: 'border-box',
  },
  textarea: {
    padding: '9px 12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '13px', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit', background: '#fafafa',
  },
  typeRow: { display: 'flex', gap: '6px' },
  typeBtn: {
    padding: '7px 16px', borderRadius: '6px',
    border: '1px solid #ddd', background: 'white',
    fontSize: '13px', color: '#555', cursor: 'pointer',
  },
  typeBtnActive: {
    background: '#1A73E8', color: 'white', border: '1px solid #1A73E8',
  },
  btnRow: { display: 'flex', gap: '10px', marginTop: '6px' },
  draftBtn: {
    flex: 1, padding: '11px', borderRadius: '8px',
    border: '1px solid #ddd', background: 'white',
    fontSize: '13px', color: '#555', cursor: 'pointer',
  },
  publishBtn: {
    flex: 2, padding: '11px', borderRadius: '8px',
    border: 'none', background: '#1A73E8',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  }
}

export default PostListingPage