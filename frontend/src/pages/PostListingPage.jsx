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

  const categories = ['Books & Notes', 'Electronics', 'Uniforms', 'Food', 'Dorm Stuff', 'Services', 'Others']
  const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('http://127.0.0.1:5000/api/listings/', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Post a Listing</h2>
          <p style={styles.subtitle}>Fill in the details of what you want to sell, rent, or trade</p>

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

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} style={styles.input} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Condition</label>
                <select name="condition" value={form.condition} onChange={handleChange} style={styles.input}>
                  <option value="">Select condition</option>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Listing Type</label>
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

            {(form.transaction_type === 'sell' || form.transaction_type === 'rent') && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Price (₱) {form.transaction_type === 'rent' && '/ per day'}
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            )}

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
                placeholder="Describe the item, its condition, and any terms..."
                value={form.description}
                onChange={handleChange}
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Preferred Meet-up Location</label>
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
              <button type="button" onClick={() => navigate('/')} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Posting...' : 'Publish listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '24px',
  },
  error: {
    background: '#fff0f0',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  typeRow: {
    display: 'flex',
    gap: '8px',
  },
  typeBtn: {
    padding: '8px 18px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
  },
  typeBtnActive: {
    background: '#534AB7',
    color: 'white',
    border: '1px solid #534AB7',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#534AB7',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  }
}

export default PostListingPage