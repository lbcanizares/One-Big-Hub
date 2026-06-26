import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const { token } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const url = filter
        ? `http://127.0.0.1:5000/api/listings/?type=${filter}`
        : 'http://127.0.0.1:5000/api/listings/'
      const res = await axios.get(url)
      setListings(res.data.listings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['', 'sell', 'rent', 'trade', 'free']
  const filterLabels = { '': 'All', sell: 'For Sale', rent: 'For Rent', trade: 'Trade', free: 'Free' }
  const badgeColors = { sell: '#534AB7', rent: '#EF9F27', trade: '#4CAF50', free: '#888', Available: '#534AB7' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Campus Listings</h2>
          <p style={styles.subheading}>Find items from fellow ADNU students</p>
        </div>

        <div style={styles.filters}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {})
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={styles.empty}>No listings found.</div>
        ) : (
          <div style={styles.grid}>
            {listings.map(listing => (
              <div key={listing.id} style={styles.card}>
                <div style={styles.imageBox}>
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>No photo</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.title}>{listing.title}</span>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: badgeColors[listing.transaction_type] || '#534AB7'
                    }}>
                      {listing.transaction_type}
                    </span>
                  </div>
                  <div style={styles.price}>
                    {listing.price ? `₱ ${Number(listing.price).toLocaleString()}` : listing.transaction_type === 'free' ? 'Free' : 'Open to offers'}
                  </div>
                  <div style={styles.seller}>by {listing.seller.name}</div>
                  {listing.meetup_location && (
                    <div style={styles.location}>📍 {listing.meetup_location}</div>
                  )}
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    marginBottom: '20px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
  },
  subheading: {
    fontSize: '14px',
    color: '#888',
    marginTop: '4px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 18px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: '#534AB7',
    color: 'white',
    border: '1px solid #534AB7',
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
    transition: 'transform 0.2s',
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
    alignItems: 'flex-start',
    gap: '6px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '99px',
    color: 'white',
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#534AB7',
  },
  seller: {
    fontSize: '12px',
    color: '#888',
  },
  location: {
    fontSize: '11px',
    color: '#aaa',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#aaa',
    fontSize: '15px',
  }
}

export default HomePage