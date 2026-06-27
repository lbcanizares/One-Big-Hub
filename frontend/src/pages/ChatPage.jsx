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
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (id) fetchMessages()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(res.data.conversations)
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
      await axios.post(`http://127.0.0.1:5000/api/chat/conversations/${id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const activeConvo = conversations.find(c => c.id === parseInt(id))
  const otherPerson = activeConvo
    ? (activeConvo.buyer.id === user.id ? activeConvo.seller : activeConvo.buyer)
    : null

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        {/* Left - Conversation list */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Messages</div>
          {loading ? (
            <div style={styles.empty}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={styles.empty}>No conversations yet</div>
          ) : (
            conversations.map(c => {
              const other = c.buyer.id === user.id ? c.seller : c.buyer
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  style={{
                    ...styles.convoItem,
                    ...(parseInt(id) === c.id ? styles.convoItemActive : {})
                  }}
                >
                  <div style={styles.convoAvatar}>
                    {other.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.convoInfo}>
                    <div style={styles.convoName}>{other.name}</div>
                    <div style={styles.convoListing}>{c.listing.title}</div>
                    {c.last_message && (
                      <div style={styles.convoLastMsg}>{c.last_message}</div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right - Chat window */}
        <div style={styles.chatWindow}>
          {!id ? (
            <div style={styles.noChat}>
              <div style={styles.noChatIcon}>💬</div>
              <div>Select a conversation to start chatting</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={styles.chatHeader}>
                {otherPerson && (
                  <>
                    <div style={styles.headerAvatar}>
                      {otherPerson.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.headerName}>{otherPerson.name}</div>
                      {activeConvo && (
                        <div style={styles.headerListing}>
                          re: {activeConvo.listing.title}
                        </div>
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
                          {m.content}
                          <div style={styles.msgTime}>
                            {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <button type="submit" style={styles.sendBtn}>Send</button>
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
    display: 'flex',
    height: 'calc(100vh - 56px)',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
    gap: '16px',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '16px 20px',
    fontWeight: '700',
    fontSize: '16px',
    borderBottom: '1px solid #eee',
  },
  convoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
  },
  convoItemActive: {
    background: '#f0efff',
  },
  convoAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#534AB7',
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
  convoName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  convoListing: {
    fontSize: '11px',
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  convoLastMsg: {
    fontSize: '11px',
    color: '#aaa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatWindow: {
    flex: 1,
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
    color: '#aaa',
    gap: '10px',
    fontSize: '14px',
  },
  noChatIcon: {
    fontSize: '40px',
  },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#534AB7',
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
    color: '#333',
  },
  headerListing: {
    fontSize: '11px',
    color: '#888',
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
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '16px',
    maxWidth: '60%',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  bubbleMine: {
    background: '#534AB7',
    color: 'white',
    borderRadius: '16px 16px 4px 16px',
  },
  bubbleOther: {
    background: '#f0f0f0',
    color: '#333',
    borderRadius: '16px 16px 16px 4px',
  },
  msgTime: {
    fontSize: '10px',
    marginTop: '4px',
    opacity: 0.7,
    textAlign: 'right',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    padding: '14px 16px',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '99px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 20px',
    borderRadius: '99px',
    border: 'none',
    background: '#534AB7',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#aaa',
    fontSize: '13px',
  }
}

export default ChatPage