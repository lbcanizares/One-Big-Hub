import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function ChatPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])
  useEffect(() => { 
    if (id) { 
    fetchMessages() 
    const interval = setInterval(fetchMessages, 3000) 
    return () => clearInterval(interval) 
    } 
   }, [id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchConversations = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const sorted = res.data.conversations.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
    setConversations(sorted)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/chat/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data.messages)
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      await axios.post(
        `http://127.0.0.1:5000/api/chat/conversations/${id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const respondOffer = async (offerId, status) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/offers/${offerId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const activeConvo = conversations.find(c => c.id === parseInt(id))
  const otherPerson = activeConvo
    ? (activeConvo.buyer.id === user.id ? activeConvo.seller : activeConvo.buyer)
    : null

  const filteredConvos = conversations.filter(c => {
    const other = c.buyer.id === user.id ? c.seller : c.buyer
    return other.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Left sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.backBtn} onClick={() => navigate('/')}>← </div>
            <div style={styles.sidebarTitle}>Chat</div>
            <div style={styles.moreBtn}>⋯</div>
          </div>
          <div style={styles.searchWrap}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.convoList}>
            {loading ? (
              <div style={styles.empty}>Loading...</div>
            ) : filteredConvos.length === 0 ? (
              <div style={styles.empty}>No conversations yet</div>
            ) : (
              filteredConvos.map(c => {
                const other = c.buyer.id === user.id ? c.seller : c.buyer
                const isActive = parseInt(id) === c.id
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/chat/${c.id}`)}
                    style={{
                      ...styles.convoItem,
                      ...(isActive ? styles.convoItemActive : {})
                    }}
                  >
                    <div style={styles.convoAvatar}>
                        {other.profile_photo ? (
                            <img src={other.profile_photo} alt={other.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      other.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={styles.convoInfo}>
                      <div style={styles.convoTop}>
                        <span style={styles.convoName}>{other.name}</span>
                        <span style={styles.convoTime}>
                          {c.last_message_time
                            ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <div style={styles.convoSub}>{c.listing.title}</div>
                      {c.last_message && (
                        <div style={styles.convoLast}>{c.last_message}</div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div style={styles.chatWindow}>
          {!id ? (
            <div style={styles.noChat}>
              <div style={styles.noChatIcon}>💬</div>
              <div style={styles.noChatText}>Select a conversation</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={styles.chatHeader}>
                {otherPerson && (
                  <>
                  <div style={{ ...styles.headerAvatar, cursor: 'pointer' }} onClick={() => navigate(`/user/${otherPerson.id}`)}>
                    {otherPerson.profile_photo ? (
                      <img src={otherPerson.profile_photo} alt={otherPerson.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        otherPerson.name.charAt(0).toUpperCase()
                        )}
                    </div>
                      <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${otherPerson.id}`)}>
                        <div style={styles.headerName}>{otherPerson.name}</div>
                      {activeConvo && (
                        <div style={styles.headerSub}> {otherPerson.department || 'ADNU'} · {'★'.repeat(Math.round(otherPerson.rating || 0))}{'☆'.repeat(5 - Math.round(otherPerson.rating || 0))} </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div style={styles.messages}>
                {messages.length === 0 ? (
                  <div style={styles.noMessages}>No messages yet. Say hi!</div>
                ) : (
                  messages.map(m => {
                    const isMine = m.sender_id === user.id
                    return (
                      <div
                        key={m.id}
                        style={{
                          ...styles.messageRow,
                          justifyContent: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {!isMine && (
                          <div style={styles.msgAvatar}>
                            {m.sender_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{
                          ...styles.bubble,
                          ...(isMine ? styles.bubbleMine : styles.bubbleOther)
                        }}>
                          {m.message_type === 'offer' && m.offer ? (
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                💰 Offer: ₱{m.offer.price ?? '—'}
                              </div>
                              {m.content && <div style={{ marginBottom: 6 }}>{m.content}</div>}
                              {m.offer.status === 'pending' && !isMine && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                  <button onClick={() => respondOffer(m.offer.id, 'accepted')} style={styles.acceptBtn}>
                                    Accept
                                  </button>
                                  <button onClick={() => respondOffer(m.offer.id, 'declined')} style={styles.declineBtn}>
                                    Decline
                                  </button>
                                </div>
                              )}
                              {m.offer.status !== 'pending' && (
                                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>
                                  <div>Offer {m.offer.status}</div>
                                    {m.offer.status === 'accepted' && activeConvo && (
                                  <div>
                                    <span
                                      onClick={() => navigate(`/review/${activeConvo.listing.id}?with=${otherPerson.id}&name=${encodeURIComponent(otherPerson.name)}`)}
                                      style={styles.reviewLink}
                                      >
                                      Leave a review
                                    </span>
                                  </div>
                                 )}
                              </div>
                            )}
                            </div>
                          ) : m.message_type === 'system' ? (
                            <div style={{ fontStyle: 'italic', opacity: 0.7 }}>{m.content}</div>
                          ) : (
                            m.content
                          )}
                          <div style={styles.msgTime}>
                            {new Date(m.sent_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={styles.inputRow}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={styles.input}
                />
                <button type="submit" style={styles.sendBtn}>➤</button>
              </form>
            </>
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
    height: 'calc(100vh - 57px)',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
    gap: '16px',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  backBtn: {
    fontSize: '16px',
    cursor: 'pointer',
    color: '#555',
  },
  sidebarTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  moreBtn: {
    fontSize: '18px',
    cursor: 'pointer',
    color: '#555',
  },
  searchWrap: {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
  },
  searchInput: {
    width: '100%',
    padding: '7px 12px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    fontSize: '12px',
    outline: 'none',
    background: '#f5f5f5',
    boxSizing: 'border-box',
  },
  convoList: {
    flex: 1,
    overflowY: 'auto',
  },
  convoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
  },
  convoItemActive: {
    background: '#e8f0fe',
  },
  convoAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  convoInfo: {
    flex: 1,
    minWidth: 0,
  },
  convoTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convoName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  convoTime: {
    fontSize: '10px',
    color: '#aaa',
  },
  convoSub: {
    fontSize: '11px',
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  convoLast: {
    fontSize: '11px',
    color: '#aaa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatWindow: {
    flex: 1,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  noChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  noChatIcon: { fontSize: '40px' },
  noChatText: { fontSize: '14px', color: '#aaa' },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  headerName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSub: {
    fontSize: '11px',
    color: '#888',
  },
  listingPill: {
    marginLeft: 'auto',
    background: '#f0f4ff',
    border: '1px solid #d0e1ff',
    borderRadius: '8px',
    padding: '4px 10px',
  },
  listingPillText: {
    fontSize: '11px',
    color: '#1A73E8',
    fontWeight: '500',
  },
  messages: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  noMessages: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '13px',
    marginTop: '20px',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  msgAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    flexShrink: 0,
  },
  bubble: {
    padding: '9px 13px',
    borderRadius: '16px',
    maxWidth: '60%',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  bubbleMine: {
    background: '#1A73E8',
    color: 'white',
    borderRadius: '16px 16px 4px 16px',
  },
  bubbleOther: {
    background: '#f0f0f0',
    color: '#1a1a1a',
    borderRadius: '16px 16px 16px 4px',
  },
  msgTime: {
    fontSize: '9px',
    marginTop: '3px',
    opacity: 0.7,
    textAlign: 'right',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '9px 16px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    fontSize: '13px',
    outline: 'none',
    background: '#f5f5f5',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: '#1A73E8',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#aaa',
    fontSize: '13px',
  },
  acceptBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#4CAF50',
    color: 'white',
    fontSize: '11px',
    cursor: 'pointer',
  },
  declineBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#e53e3e',
    color: 'white',
    fontSize: '11px',
    cursor: 'pointer',
  },
  reviewLink: {
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: 'inherit',
  color: 'inherit',
  }
}

export default ChatPage