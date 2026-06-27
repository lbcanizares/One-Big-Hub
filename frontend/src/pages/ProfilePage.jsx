import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchMyListings()
  }, [])

  const fetchMyListings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/listings/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const myListings = res.data.listings.filter(l => l.seller.id === parseInt(user.id))
      setListings(myListings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkSold = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/listings/${id}`,
        { status: 'Sold' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchMyListings()
    } catch (err) {
      console.error(err)
    }
  }

  const activeListings = listings.filter(l => l.status === 'Available')
  const soldListings = listings.filter(l => l.status !== 'Available')
  const displayedListings = activeTab === 'active' ? activeListings : soldListings

  const badgeColors = { sell: '#534AB7', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Profile header */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.info}>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.email}>{user.email}</div>
            {user.department && (
              <div style={styles.dept}>{user.department}</div>
            )}
            <div style={styles.stats}>
              <span style={styles.stat}>⭐ {user.rating || '0.0'} rating</span>
              <span style={styles.stat}>📦 {activeListings.length} active</span>
              <span style={styles.stat}>✅ {soldListings.length} sold/done</span>
            </div>
          </div>
          <button onClick={() => navigate('/post')} style={styles.postBtn}>
            + Post listing
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('active')}
            style={{ ...styles.tab, ...(activeTab === 'active' ? styles.tabActive : {}) }}
          >
            Active listings ({activeListings.length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            style={{ ...styles.tab, ...(activeTab === 'sold' ? styles.tabActive : {}) }}
          >
            Sold / Done ({soldListings.length})
          </button>
        </div>

        {/* Listings grid */}
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : displayedListings.length === 0 ? (
          <div style={styles.empty}>
            {activeTab === 'active' ? 'No active listings. Post something!' : 'No sold listings yet.'}
          </div>
        ) : (
          <div style={styles.grid}>
            {displayedListings.map(l => (
              <div key={l.id} style={styles.card}>
                <div
                  style={styles.imageBox}
                  onClick={() => navigate(`/listing/${l.id}`)}
                >
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>No photo</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.title}>{l.title}</span>
                    <span style={{
                      ...styles.badge,
                      background: badgeColors[l.transaction_type] || '#534AB7'
                    }}>
                      {l.transaction_type}
                    </span>
                  </div>
                  <div style={styles.price}>
                    {l.price ? `₱ ${Number(l.price).toLocaleString()}` : 'Open to offers'}
                  </div>
                  <div style={styles.cardActions}>
                    {l.status === 'Available' && (
                      <button
                        onClick={() => handleMarkSold(l.id)}
                        style={styles.soldBtn}
                      >
                        Mark as sold
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(l.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
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
  profileCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#534AB7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
  },
  email: {
    fontSize: '13px',
    color: '#888',
  },
  dept: {
    fontSize: '13px',
    color: '#534AB7',
    fontWeight: '500',
  },
  stats: {
    display: 'flex',
    gap: '14px',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  stat: {
    fontSize: '12px',
    color: '#666',
    background: '#f5f5f5',
    padding: '4px 10px',
    borderRadius: '99px',
  },
  postBtn: {
    padding: '10px 20px',
    background: '#534AB7',
    color: 'white',
    border: 'none',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  tab: {
    padding: '8px 20px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
  },
  tabActive: {
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
  },
  imageBox: {
    height: '140px',
    background: '#f0efff',
    cursor: 'pointer',
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
    gap: '6px',
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
  cardActions: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
  },
  soldBtn: {
    flex: 1,
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #4CAF50',
    background: 'white',
    color: '#4CAF50',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  deleteBtn: {
    flex: 1,
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #e53e3e',
    background: 'white',
    color: '#e53e3e',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#aaa',
    fontSize: '14px',
  }
}

export default ProfilePage