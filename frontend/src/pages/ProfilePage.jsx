import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, token, logout, updateUser } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [profileData, setProfileData] = useState(null)
  const [reviews, setReviews] = useState([])
  
  useEffect(() => {
  fetchMyListings()
  fetchProfile()
}, [])

const fetchProfile = async () => {
  try {
    const res = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    updateUser(res.data.user)
  } catch (err) {
    console.error(err)
  }
}

useEffect(() => {
  fetchMyListings()
  fetchProfile()
  fetchReviews()
}, [])

const fetchReviews = async () => {
  try {
    const res = await api.get(`/api/reviews/user/${user.id}`)
    setReviews(res.data.reviews)
  } catch (err) {
    console.error(err)
  }
}

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fetchMyListings = async () => {
  try {
    const res = await api.get('/api/listings/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setListings(res.data.listings)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.delete(`/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkSold = async (listing) => {
  const confirmed = window.confirm(`Mark "${listing.title}" as sold?`)
  if (!confirmed) return
  try {
    await api.put(`/api/listings/${listing.id}`,
      { status: 'Sold' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    fetchMyListings()
    navigate(`/review/${listing.id}`)
  } catch (err) {
    console.error(err)
  }
}

  const activeListings = listings.filter(l => l.status === 'Available')
  const soldListings = listings.filter(l => l.status === 'Sold')
  const rentedListings = listings.filter(l => l.status === 'Rented')
  const tradedListings = listings.filter(l => l.status === 'Traded')

  const tabs = [
    { key: 'active', label: 'Active listing' },
    { key: 'sold', label: 'Sold / Traded / Rented out' },
    { key: 'reviews', label: 'Reviews' },
  ] 

 const inactiveListings = listings.filter(l => l.status !== 'Available')

 const displayedListings =
  activeTab === 'active' ? activeListings :
  activeTab === 'sold' ? inactiveListings : []

  const badgeColors = { sell: '#1A73E8', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Profile header */}
        <div style={styles.profileCard}>
          <div style={styles.avatarWrap}>
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>
               {user.name.charAt(0).toUpperCase()}
          </div>
         )}
      </div>
          <div style={styles.info}>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.university}>{user.department || 'ADNU Student'} · Ateneo de Naga University</div>
            <div style={styles.stats}>
              <span style={styles.stat}>⭐ {user.rating || '0.0'} rating</span>
              <span style={styles.stat}>📦 {activeListings.length} listed</span>
              <span style={styles.stat}>✅ {inactiveListings.length} sold/traded/rented</span>
            </div>
          </div>
          <div style={styles.btnGroup}>
            <button onClick={() => navigate('/edit-profile')} style={styles.postBtn}>Edit profile</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                ...styles.tab,
                ...(activeTab === t.key ? styles.tabActive : {})
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'reviews' ? (
          reviews.length === 0 ? (
            <div style={styles.empty}>No reviews yet.</div>
        ) : (
          <div style={styles.reviewsList}>
            {reviews.map(r => (
              <div key={r.id} style={styles.reviewCard}>
                <div style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                {r.comment && <div style={styles.reviewComment}>{r.comment}</div>}
                <div style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</div>
             </div>
           ))}
        </div>
      )
      ) : loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : displayedListings.length === 0 ? (
          <div style={styles.empty}>No listings here yet.</div>
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
                    <div style={styles.noImage}></div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{l.title}</div>
                  <div style={styles.price}>
                    {l.price ? `₱ ${Number(l.price).toLocaleString()}` : 'Open to offers'}
                  </div>
                  <div style={styles.cardActions}>
                    {l.status === 'Available' && (
                      <button onClick={() => handleMarkSold(l)} style={styles.soldBtn}>
                        Mark sold
                      </button>
                    )}
                    <button onClick={() => handleDelete(l.id)} style={styles.deleteBtn}>
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
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  profileCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '700',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  university: {
    fontSize: '13px',
    color: '#888',
  },
  stats: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  stat: {
    fontSize: '12px',
    color: '#555',
    background: '#f0f4ff',
    padding: '3px 10px',
    borderRadius: '99px',
    border: '1px solid #d0e1ff',
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
  },
  postBtn: {
    padding: '8px 18px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '8px 18px',
    background: 'white',
    color: '#888',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '7px 16px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
  },
  tabActive: {
    background: '#1A73E8',
    color: 'white',
    border: '1px solid #1A73E8',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  imageBox: {
    height: '130px',
    background: '#e8e8e8',
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
    background: '#e8e8e8',
  },
  cardBody: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  price: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1A73E8',
  },
  cardActions: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
  },
  soldBtn: {
    flex: 1,
    padding: '5px',
    borderRadius: '6px',
    border: '1px solid #4CAF50',
    background: 'white',
    color: '#4CAF50',
    fontSize: '11px',
    cursor: 'pointer',
  },
  deleteBtn: {
    flex: 1,
    padding: '5px',
    borderRadius: '6px',
    border: '1px solid #e53e3e',
    background: 'white',
    color: '#e53e3e',
    fontSize: '11px',
    cursor: 'pointer',
  },
  avatarImg: { 
    width: '64px', 
    height: '64px', 
    borderRadius: '50%', 
    objectFit: 'cover' 
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#aaa',
    fontSize: '14px',
  },
  reviewsList: {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
},
reviewCard: {
  background: 'white',
  borderRadius: '10px',
  padding: '14px 16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
},
reviewStars: {
  color: '#FFB800',
  fontSize: '16px',
  marginBottom: '4px',
},
reviewComment: {
  fontSize: '13px',
  color: '#333',
  marginBottom: '6px',
},
reviewDate: {
  fontSize: '11px',
  color: '#aaa',
},
}

export default ProfilePage