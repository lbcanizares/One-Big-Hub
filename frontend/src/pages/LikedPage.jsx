import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function LikedPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSaved()
  }, [])

  const fetchSaved = async () => {
    try {
      const res = await api.get('/api/listings/saved', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setListings(res.data.listings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const badgeColors = { sell: '#534AB7', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Likes</h2>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={styles.empty}>No saved listings yet. Heart an item to save it!</div>
        ) : (
          <div style={styles.grid}>
            {listings.map(l => (
              <div key={l.id} style={styles.card} onClick={() => navigate(`/listing/${l.id}`)}>
                <div style={styles.imageBox}>
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>No photo</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.title}>{l.title}</span>
                    <span style={styles.heart}>♥</span>
                  </div>
                  <div style={styles.price}>
                    {l.price ? `₱ ${Number(l.price).toLocaleString()}` : 'Free'}
                  </div>
                  <span style={{
                    ...styles.badge,
                    background: badgeColors[l.transaction_type] || '#534AB7'
                  }}>
                    {l.transaction_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    cursor: 'pointer',
  },
  imageBox: {
    height: '150px',
    background: '#f0efff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: '13px',
  },
  cardBody: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  heart: {
    color: '#e53e3e',
    fontSize: '16px',
  },
  price: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#534AB7',
  },
  badge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '99px',
    color: 'white',
    textTransform: 'capitalize',
    width: 'fit-content',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#aaa',
    fontSize: '14px',
  }
}

export default LikedPage