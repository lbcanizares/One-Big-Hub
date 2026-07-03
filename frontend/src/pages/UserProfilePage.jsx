import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

function UserProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchListings()
  }, [id])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/auth/user/${id}`)
      setProfile(res.data.user)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchListings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/listings/')
      const userListings = res.data.listings.filter(l => l.seller.id === parseInt(id))
      setListings(userListings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const badgeColors = { sell: '#1A73E8', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }

  if (loading) return <div><Navbar /><div style={styles.center}>Loading...</div></div>

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

        {profile && (
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.info}>
              <div style={styles.name}>{profile.name}</div>
              <div style={styles.dept}>{profile.department || 'ADNU'}</div>
              <div style={styles.stats}>
                <span style={styles.stat}>⭐ {profile.rating || '0.0'} rating</span>
                <span style={styles.stat}>📦 {listings.length} listings</span>
                {profile.contact_number && (
                  <span style={styles.stat}>📞 {profile.contact_number}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={styles.sectionTitle}>Listings</div>
        {listings.length === 0 ? (
          <div style={styles.empty}>No listings yet.</div>
        ) : (
          <div style={styles.grid}>
            {listings.map(l => (
              <div
                key={l.id}
                style={styles.card}
                onClick={() => navigate(`/listing/${l.id}`)}
              >
                <div style={styles.imageBox}>
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}></div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.cardTitle}>{l.title}</span>
                    <span style={{
                      ...styles.badge,
                      background: badgeColors[l.transaction_type] || '#1A73E8'
                    }}>
                      {l.transaction_type}
                    </span>
                  </div>
                  <div style={styles.price}>
                    {l.price ? `₱ ${Number(l.price).toLocaleString()}` : 'Free'}
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
  page: { minHeight: '100vh', background: '#f5f5f5' },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  backBtn: {
    background: 'none', border: 'none', color: '#1A73E8',
    fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0,
  },
  profileCard: {
    background: 'white', borderRadius: '12px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '20px',
    marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: '#1A73E8', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '26px', fontWeight: '700', flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
  dept: { fontSize: '13px', color: '#888', marginTop: '2px' },
  stats: { display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' },
  stat: {
    fontSize: '12px', color: '#555', background: '#f0f4ff',
    padding: '3px 10px', borderRadius: '99px', border: '1px solid #d0e1ff',
  },
  sectionTitle: {
    fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  },
  card: {
    background: 'white', borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  imageBox: { height: '140px', background: '#e8e8e8', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { height: '100%', background: '#e8e8e8' },
  cardBody: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' },
  cardTitle: { fontSize: '13px', fontWeight: '600', color: '#1a1a1a', flex: 1 },
  badge: {
    fontSize: '9px', padding: '2px 7px', borderRadius: '99px',
    color: 'white', textTransform: 'capitalize', whiteSpace: 'nowrap',
  },
  price: { fontSize: '14px', fontWeight: '700', color: '#1A73E8' },
  empty: { textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '14px' },
  center: { textAlign: 'center', padding: '60px', color: '#888' },
}

export default UserProfilePage