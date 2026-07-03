import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function ListingDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showOffer, setShowOffer] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMsg, setOfferMsg] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => { fetchListing() }, [id])
  

  const fetchListing = async () => {
  try {
    const res = await axios.get(`http://127.0.0.1:5000/api/listings/${id}`)
    setListing(res.data.listing)

    const savedRes = await axios.get('http://127.0.0.1:5000/api/listings/saved', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const isSaved = savedRes.data.listings.some(l => l.id === parseInt(id))
    setSaved(isSaved)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const handleSave = async () => {
  console.log('token:', token)
  console.log('listing id:', listing.id)
  try {
    const res = await axios.post(
      `http://127.0.0.1:5000/api/listings/${listing.id}/save`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    console.log('save response:', res.data)
    setSaved(res.data.saved)
  } catch (err) {
    console.error('save error:', err)
  }
}

  const handleChat = async () => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/chat/conversations',
        { listing_id: listing.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate(`/chat/${res.data.conversation_id}`)
    } catch (err) {
      setError('Failed to start conversation')
    }
  }

const handleOffer = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/offers/', {
      listing_id: listing.id,
      offer_price: offerPrice,
      message: offerMsg
    }, { headers: { Authorization: `Bearer ${token}` } })
    setSuccess('Offer sent!')
    setShowOffer(false)
    navigate(`/chat/${res.data.conversation_id}`)
  } catch (err) {
    setError('Failed to send offer')
  }
}

  if (loading) return <div><Navbar /><div style={styles.center}>Loading...</div></div>
  if (!listing) return <div><Navbar /><div style={styles.center}>Listing not found.</div></div>

  const isOwner = user && user.id === listing.seller.id
  const badgeColors = { sell: '#1A73E8', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : []

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back to all listings</button>

        <div style={styles.container}>
          {/* Left - Photos */}
          <div style={styles.photoSection}>
            <div style={styles.mainPhoto}>
              {photos.length > 0 ? (
                <img src={photos[activePhoto]} alt={listing.title} style={styles.mainImg} />
              ) : (
                <div style={styles.noPhoto}>Main photo</div>
              )}
            </div>
            <div style={styles.thumbRow}>
              {['Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'].map((p, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.thumb,
                    ...(photos[i + 1] ? {} : { background: '#e8e8e8' })
                  }}
                  onClick={() => photos[i + 1] && setActivePhoto(i + 1)}
                >
                  {photos[i + 1] ? (
                    <img src={photos[i + 1]} alt={p} style={styles.thumbImg} />
                  ) : (
                    <span style={styles.thumbLabel}>{p}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div style={styles.details}>
            <div style={styles.topRow}>
              <div style={styles.titleRow}>
                <h1 style={styles.title}>{listing.title}</h1>
                <span style={{
                  ...styles.badge,
                  background: badgeColors[listing.transaction_type] || '#1A73E8'
                }}>
                  {listing.transaction_type}
                </span>
              </div>
             <button onClick={() => { console.log('heart clicked'); handleSave(); }} style={styles.heartBtn}>
              {saved ? '❤️' : '🤍'}
            </button>
            </div>

            <div style={styles.price}>
              ₱ {listing.price ? Number(listing.price).toLocaleString() : '—'}
            </div>

            <div style={styles.tags}>
              {listing.category && <span style={styles.tag}>{listing.category}</span>}
              {listing.condition && <span style={styles.tag}>{listing.condition}</span>}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionLabel}>Description</div>
              <div style={styles.descBox}>
                <p style={styles.desc}>{listing.description || 'No description provided.'}</p>
              </div>
            </div>

            <div style={styles.sellerRow}>
              <div style={styles.sellerAvatar}>
                {listing.seller.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.sellerInfo}>
                <div style={styles.sellerName}>{listing.seller.name}</div>
                {listing.seller.contact_number && (
                  <div style={styles.contactNumber}>
                    📞 {listing.seller.contact_number}
                  </div>
                )}
                <div style={styles.sellerMeta}>
                  {'★'.repeat(5)} · {listing.seller.department || 'ADNU'}
                  <br />
                  <span style={styles.sellerSub}>website</span>
                </div>
              </div>
              <button style={styles.viewProfileBtn} onClick={() => navigate(`/user/${listing.seller.id}`)}>View profile</button>
            </div>

            {success && <div style={styles.success}>{success}</div>}
            {error && <div style={styles.errorBox}>{error}</div>}

            {!isOwner && (
              <div style={styles.actions}>
                <button onClick={handleChat} style={styles.chatBtn}>Chat seller</button>
                <button onClick={() => setShowOffer(!showOffer)} style={styles.offerBtn}>Make offer</button>
              </div>
            )}

            {isOwner && (
              <div style={styles.ownerNote}>This is your listing</div>
            )}

            {showOffer && (
              <div style={styles.offerBox}>
                <div style={styles.sectionLabel}>Send an Offer</div>
                <input
                  type="number"
                  placeholder="Your offer price (₱)"
                  value={offerPrice}
                  onChange={e => setOfferPrice(e.target.value)}
                  style={styles.input}
                />
                <textarea
                  placeholder="Add a message (optional)"
                  value={offerMsg}
                  onChange={e => setOfferMsg(e.target.value)}
                  style={styles.textarea}
                  rows={3}
                />
                <button onClick={handleOffer} style={styles.offerBtn}>Send Offer</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '20px 16px' },
  backBtn: {
    background: 'none', border: 'none', color: '#1A73E8',
    fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0,
  },
  container: {
    display: 'flex', gap: '28px', background: 'white',
    borderRadius: '12px', padding: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  photoSection: { flex: 1 },
  mainPhoto: {
    height: '240px', background: '#e8e8e8', borderRadius: '10px',
    marginBottom: '10px', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noPhoto: { color: '#aaa', fontSize: '14px' },
  thumbRow: { display: 'flex', gap: '8px' },
  thumb: {
    flex: 1, height: '52px', background: '#e8e8e8', borderRadius: '6px',
    overflow: 'hidden', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbLabel: { fontSize: '9px', color: '#aaa' },
  details: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  title: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a' },
  badge: {
    fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
    color: 'white', textTransform: 'capitalize', whiteSpace: 'nowrap',
  },
  heartBtn: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', flexShrink: 0,
  },
  price: { fontSize: '22px', fontWeight: '700', color: '#1A73E8' },
  tags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: {
    fontSize: '12px', padding: '4px 12px', borderRadius: '99px',
    background: '#e8f0fe', color: '#1A73E8', border: '1px solid #c5d8fc',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sectionLabel: { fontSize: '12px', fontWeight: '600', color: '#555' },
  descBox: {
    background: '#f9f9f9', borderRadius: '8px',
    padding: '12px', border: '1px solid #eee',
  },
  desc: { fontSize: '13px', color: '#555', lineHeight: '1.6' },
  sellerRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  sellerAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: '#1A73E8', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '700', flexShrink: 0,
  },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: '13px', fontWeight: '600', color: '#1a1a1a' },
  sellerMeta: { fontSize: '11px', color: '#888', lineHeight: 1.6 },
  sellerSub: { color: '#1A73E8' },
  viewProfileBtn: {
    padding: '6px 14px', borderRadius: '6px',
    border: '1px solid #ddd', background: 'white',
    fontSize: '12px', color: '#555', cursor: 'pointer',
  },
  actions: { display: 'flex', gap: '10px', marginTop: '4px' },
  chatBtn: {
    flex: 1, padding: '11px', borderRadius: '8px',
    border: '1px solid #1A73E8', background: 'white',
    color: '#1A73E8', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  offerBtn: {
    flex: 2, padding: '11px', borderRadius: '8px',
    border: 'none', background: '#1A73E8',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  ownerNote: {
    padding: '10px', background: '#e8f0fe', borderRadius: '8px',
    fontSize: '13px', color: '#1A73E8', textAlign: 'center',
  },
  offerBox: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '16px', background: '#f9f9f9', borderRadius: '10px',
  },
  input: {
    padding: '9px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px', outline: 'none',
  },
  textarea: {
    padding: '9px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
  },
  success: {
    background: '#f0fff4', color: '#276749',
    padding: '10px', borderRadius: '8px', fontSize: '13px',
  },
  errorBox: {
    background: '#fff0f0', color: '#e53e3e',
    padding: '10px', borderRadius: '8px', fontSize: '13px',
  },
  contactNumber: {
    fontSize: '13px',
    color: '#1A73E8',
    fontWeight: '500',
    marginTop: '2px',
  },
  center: { textAlign: 'center', padding: '60px', color: '#888' },
}

export default ListingDetailPage