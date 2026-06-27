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
  const [offerMsg, setOfferMsg] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [showOffer, setShowOffer] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/listings/${id}`)
      setListing(res.data.listing)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/chat/conversations',
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
      await axios.post('http://127.0.0.1:5000/api/offers/', {
        listing_id: listing.id,
        offer_price: offerPrice,
        message: offerMsg
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSuccess('Offer sent successfully!')
      setShowOffer(false)
    } catch (err) {
      setError('Failed to send offer')
    }
  }

  const handleSave = async () => {
    try {
    const res = await axios.post(
      `http://127.0.0.1:5000/api/listings/${listing.id}/save`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setSaved(res.data.saved)
  } catch (err) {
    console.error(err)
  }
}

  if (loading) return <div><Navbar /><div style={styles.center}>Loading...</div></div>
  if (!listing) return <div><Navbar /><div style={styles.center}>Listing not found.</div></div>

  const isOwner = user && user.id === listing.seller.id
  const badgeColors = { sell: '#534AB7', rent: '#EF9F27', trade: '#4CAF50', free: '#888' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back to listings</button>

        <div style={styles.container}>
          {/* Left - Photo */}
          <div style={styles.photoSection}>
            {listing.photos && listing.photos.length > 0 ? (
              <img src={listing.photos[0]} alt={listing.title} style={styles.photo} />
            ) : (
              <div style={styles.noPhoto}>No photo available</div>
            )}
          </div>

          {/* Right - Details */}
          <div style={styles.details}>
            <div style={styles.topRow}>
              <h1 style={styles.title}>{listing.title}</h1>
              <span style={{
                ...styles.badge,
                background: badgeColors[listing.transaction_type] || '#534AB7'
              }}>
                {listing.transaction_type}
              </span>
            </div>

            <div style={styles.price}>
              {listing.price
                ? `₱ ${Number(listing.price).toLocaleString()}`
                : listing.transaction_type === 'free'
                ? 'Free'
                : 'Open to offers'}
              {listing.transaction_type === 'rent' && listing.rent_duration && (
                <span style={styles.rentDuration}> / {listing.rent_duration}</span>
              )}
            </div>

            {listing.trade_for && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Looking for:</span>
                <span>{listing.trade_for}</span>
              </div>
            )}

            <div style={styles.tags}>
              {listing.category && <span style={styles.tag}>{listing.category}</span>}
              {listing.condition && <span style={styles.tag}>{listing.condition}</span>}
            </div>

            <hr style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Description</div>
              <p style={styles.description}>{listing.description || 'No description provided.'}</p>
            </div>

            <hr style={styles.divider} />

            <div style={styles.sellerRow}>
              <div style={styles.sellerAvatar}>
                {listing.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.sellerName}>{listing.seller.name}</div>
                <div style={styles.sellerInfo}>
                  {listing.seller.department} · ★ {listing.seller.rating || '0.0'}
                </div>
              </div>
            </div>

            {listing.meetup_location && (
              <div style={styles.meetup}>
                📍 Meet-up: {listing.meetup_location}
              </div>
            )}

            <hr style={styles.divider} />

            {success && <div style={styles.success}>{success}</div>}
            {error && <div style={styles.error}>{error}</div>}

            {!isOwner && (
              <div style={styles.actions}>
                <button onClick={handleChat} style={styles.chatBtn}>
                  💬 Chat Seller
                </button>
                <button onClick={() => setShowOffer(!showOffer)} style={styles.offerBtn}>
                  Make Offer
                </button>
              </div>
            )}

            {isOwner && (
              <div style={styles.ownerNote}>
                This is your listing
              </div>
            )}

            {showOffer && (
              <div style={styles.offerBox}>
                <div style={styles.sectionTitle}>Send an Offer</div>
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
                <button onClick={handleOffer} style={styles.offerBtn}>
                  Send Offer
                </button>
              </div>
            )}
          </div>
        </div>
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
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#534AB7',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: '0',
  },
  container: {
    display: 'flex',
    gap: '32px',
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  photoSection: {
    flex: 1,
  },
  photo: {
    width: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    maxHeight: '360px',
  },
  noPhoto: {
    height: '300px',
    background: '#f0efff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: '14px',
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  badge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '99px',
    color: 'white',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  price: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#534AB7',
  },
  rentDuration: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#888',
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
    color: '#555',
  },
  infoLabel: {
    fontWeight: '500',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '99px',
    background: '#f0efff',
    color: '#534AB7',
    border: '1px solid #AFA9EC',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #eee',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
  },
  description: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
  },
  sellerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sellerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#534AB7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  sellerName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  sellerInfo: {
    fontSize: '12px',
    color: '#888',
  },
  meetup: {
    fontSize: '13px',
    color: '#666',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  chatBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #534AB7',
    background: 'white',
    color: '#534AB7',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  offerBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#534AB7',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ownerNote: {
    padding: '10px',
    background: '#f0efff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#534AB7',
    textAlign: 'center',
  },
  offerBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    background: '#f9f9f9',
    borderRadius: '10px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
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
  success: {
    background: '#f0fff4',
    color: '#276749',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  error: {
    background: '#fff0f0',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  saveBtn: {
    padding: '6px 14px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    },
  center: {
    textAlign: 'center',
    padding: '60px',
    color: '#888',
  }
}

export default ListingDetailPage