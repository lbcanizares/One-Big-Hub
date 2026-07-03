import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function ReviewPage() {
  const { listing_id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [searchParams] = useSearchParams()
  const reviewedUserId = searchParams.get('with')
  const reviewedName = searchParams.get('name') || 'User'

  useEffect(() => {
    fetchListing()
  }, [])

  const fetchListing = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/listings/${listing_id}`)
      setListing(res.data.listing)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await axios.post('http://127.0.0.1:5000/api/reviews/', {
        listing_id: parseInt(listing_id),
        reviewed_user_id: parseInt(reviewedUserId),
        rating,
        comment
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSuccess('Review submitted!')
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!listing) return <div><Navbar /><div style={styles.center}>Loading...</div></div>

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.card}>
          <h2 style={styles.title}>Leave a Review</h2>
          <p style={styles.subtitle}>How was your experience with this seller?</p>

         <div style={styles.sellerRow}>
           <div style={styles.avatar}>
            {reviewedName.charAt(0).toUpperCase()}
             </div>
            <div>
            <div style={styles.sellerName}>{reviewedName}</div>
            <div style={styles.itemName}>re: {listing.title}</div>
        </div>
</div>

          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Rating</label>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <span
                  key={s}
                  onClick={() => setRating(s)}
                  style={{
                    fontSize: '32px',
                    cursor: 'pointer',
                    color: s <= rating ? '#FFB800' : '#ddd'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.btnRow}>
            <button onClick={() => navigate('/profile')} style={styles.skipBtn}>
              Skip
            </button>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  body: { maxWidth: '500px', margin: '0 auto', padding: '24px 16px' },
  card: {
    background: 'white', borderRadius: '12px', padding: '32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  sellerRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '24px', padding: '12px',
    background: '#f5f5f5', borderRadius: '8px',
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#1A73E8', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700',
  },
  sellerName: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  itemName: { fontSize: '12px', color: '#888' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#444' },
  stars: { display: 'flex', gap: '4px' },
  textarea: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
  },
  btnRow: { display: 'flex', gap: '10px', marginTop: '8px' },
  skipBtn: {
    flex: 1, padding: '11px', borderRadius: '8px',
    border: '1px solid #ddd', background: 'white',
    fontSize: '13px', color: '#555', cursor: 'pointer',
  },
  submitBtn: {
    flex: 2, padding: '11px', borderRadius: '8px',
    border: 'none', background: '#1A73E8',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  success: {
    background: '#f0fff4', color: '#276749', padding: '10px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  center: { textAlign: 'center', padding: '60px', color: '#888' },
}

export default ReviewPage