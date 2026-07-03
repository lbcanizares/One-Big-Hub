import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchListings()
  }, [filter, category])

const [sort, setSort] = useState('newest')

const fetchListings = async () => {
  setLoading(true)
  try {
    let url = 'http://127.0.0.1:5000/api/listings/?'
    if (filter) url += `type=${filter}&`
    if (category) url += `category=${category}&`
    if (sort) url += `sort=${sort}&`
    const res = await axios.get(url)
    setListings(res.data.listings)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
  const badgeColors = {
    sell: '#1A73E8',
    rent: '#EF9F27',
    trade: '#4CAF50',
    free: '#888'
  }

  const categories = ['Books', 'Electronics', 'Uniforms', 'Food', 'Dorm stuff', 'Services', 'Others']

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarTitle}>Listing Type</div>
            {[
              { label: 'All listings', value: '' },
              { label: 'For sale', value: 'sell' },
              { label: 'For trade', value: 'trade' },
              { label: 'For rent', value: 'rent' },
              { label: 'Free items', value: 'free' },
            ].map(item => (
              <div
                key={item.value}
                onClick={() => setFilter(item.value)}
                style={{
                  ...styles.sidebarItem,
                  ...(filter === item.value ? styles.sidebarItemActive : {})
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarTitle}>Category</div>
            {categories.map(c => (
              <div
                key={c}
                onClick={() => setCategory(category === c ? '' : c)}
                style={{
                  ...styles.sidebarItem,
                  ...(category === c ? styles.sidebarItemActive : {})
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={styles.main}>
          <div style={styles.topRow}>
            <div style={styles.heading}>
              {filter === '' ? 'All listings' :
               filter === 'sell' ? 'For sale' :
               filter === 'rent' ? 'For rent' :
               filter === 'trade' ? 'For trade' :
               filter === 'free' ? 'Free items' : 'All listings'}
              {category ? ` · ${category}` : ''}
            </div>
            <div style={styles.sortBox}onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}>Sort: {sort === 'newest' ? 'Newest ▾' : 'Oldest ▾'}</div>
          </div>

          {loading ? (
            <div style={styles.empty}>Loading listings...</div>
          ) : listings.length === 0 ? (
            <div style={styles.empty}>No listings found.</div>
          ) : (
            <div style={styles.grid}>
              {listings.map(listing => (
                <div
                  key={listing.id}
                  style={styles.card}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  <div style={styles.imageBox}>
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.title} style={styles.image} />
                    ) : (
                      <div style={styles.noImage}></div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardTop}>
                      <span style={styles.cardTitle}>{listing.title}</span>
                      <span style={{
                        ...styles.badge,
                        background: badgeColors[listing.transaction_type] || '#1A73E8'
                      }}>
                        {listing.transaction_type}
                      </span>
                    </div>
                    <div style={styles.price}>
                      {listing.price
                        ? `₱ ${Number(listing.price).toLocaleString()}`
                        : listing.transaction_type === 'free' ? 'Free' : 'Open to offers'}
                    </div>
                    <div style={styles.seller}>by {listing.seller.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  body: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 16px',
    gap: '16px',
    boxSizing: 'border-box',
    width: '100%',
  },
  sidebar: {
    width: '160px',
    minWidth: '120px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sidebarTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sidebarItem: {
    fontSize: '13px',
    color: '#555',
    padding: '5px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  sidebarItemActive: {
    color: '#1A73E8',
    fontWeight: '600',
    background: '#e8f0fe',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sortBox: {
    fontSize: '12px',
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    background: 'white',
    color: '#555',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s',
  },
  imageBox: {
    height: '140px',
    background: '#e8e8e8',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    height: '100%',
    background: '#e8e8e8',
  },
  cardBody: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '6px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  badge: {
    fontSize: '9px',
    padding: '2px 7px',
    borderRadius: '99px',
    color: 'white',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  price: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A73E8',
  },
  seller: {
    fontSize: '11px',
    color: '#999',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#aaa',
    fontSize: '14px',
  }
}

export default HomePage