import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import {
 collection, addDoc, getDocs, onSnapshot,
 doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore'

import './debates.css'
import './homepage.css'

const REPORT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeqT5I7IM6z3m2H6qV-oWbVj6802AnRfTZa7lyUQDvnmOkuhA/viewform'

const Debates = (props) => {
 const { user, userRole, isCEO, isEditor, isLoggedIn, signInWithGoogle } = useAuth()
 const history = useHistory()

 const [debates, setDebates] = useState([])
 const [selectedDebate, setSelectedDebate] = useState(null)
 const [messages, setMessages] = useState([])
 const [newMessage, setNewMessage] = useState('')
 const [modNote, setModNote] = useState('')
 const [showModBox, setShowModBox] = useState(false)
 const [showNewDebateForm, setShowNewDebateForm] = useState(false)
 const [newDebateTitle, setNewDebateTitle] = useState('')
 const [newDebateDesc, setNewDebateDesc] = useState('')
 const [newDebateType, setNewDebateType] = useState('current') // 'current' or 'hot'
 const messagesEndRef = useRef(null)

 // Load all debates
 useEffect(() => {
 const unsub = onSnapshot(collection(db, 'debates'), snap => {
 setDebates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
 })
 return () => unsub()
 }, [])

 // Load messages for selected debate
 useEffect(() => {
 if (!selectedDebate) return
 const q = query(collection(db, 'debates', selectedDebate.id, 'messages'), orderBy('createdAt', 'asc'))
 const unsub = onSnapshot(q, snap => {
 setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
 })
 return () => unsub()
 }, [selectedDebate])

 // Scroll to bottom on new message
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [messages])

 const handleSendMessage = async () => {
 if (!newMessage.trim() || !isLoggedIn || selectedDebate?.status === 'stopped') return
 await addDoc(collection(db, 'debates', selectedDebate.id, 'messages'), {
 text: newMessage.trim(),
 authorName: user.displayName,
 authorPhoto: user.photoURL,
 authorUid: user.uid,
 isModNote: false,
 createdAt: serverTimestamp(),
 })
 setNewMessage('')
 }

 const handleSendModNote = async () => {
 if (!modNote.trim()) return
 await addDoc(collection(db, 'debates', selectedDebate.id, 'messages'), {
 text: modNote.trim(),
 authorName: user.displayName + ' (Moderator)',
 authorPhoto: user.photoURL,
 authorUid: user.uid,
 isModNote: true,
 createdAt: serverTimestamp(),
 })
 setModNote('')
 setShowModBox(false)
 }

 const handleDeleteMessage = async (msgId) => {
 await deleteDoc(doc(db, 'debates', selectedDebate.id, 'messages', msgId))
 }

 const handleCreateDebate = async () => {
 if (!newDebateTitle.trim()) return
 if (isCEO) {
 await addDoc(collection(db, 'debates'), {
 title: newDebateTitle.trim(),
 description: newDebateDesc.trim(),
 type: newDebateType,
 createdAt: serverTimestamp(),
 createdBy: user.displayName,
 })
 } else {
 await addDoc(collection(db, 'debateRequests'), {
 title: newDebateTitle.trim(),
 description: newDebateDesc.trim(),
 submittedBy: user.displayName,
 submittedByUid: user.uid,
 createdAt: serverTimestamp(),
 status: 'pending',
 })
 }
 setNewDebateTitle('')
 setNewDebateDesc('')
 setShowNewDebateForm(false)
 }

 const handleStopDebate = async () => {
 await updateDoc(doc(db, 'debates', selectedDebate.id), { status: 'stopped' })
 setSelectedDebate(prev => ({ ...prev, status: 'stopped' }))
 }

 const handleMoveToPast = async (debateId) => {
 await updateDoc(doc(db, 'debates', debateId), { type: 'past', status: null })
 setSelectedDebate(null)
 }

 const handleDeleteDebate = async (debateId) => {
 if (!window.confirm('Delete this debate permanently?')) return
 await deleteDoc(doc(db, 'debates', debateId))
 if (selectedDebate?.id === debateId) setSelectedDebate(null)
 }

 const currentDebates = debates.filter(d => d.type === 'current' && d.status !== 'stopped')
 const hotDebates = debates.filter(d => d.type === 'past')
 const stoppedDebates = debates.filter(d => d.status === 'stopped')

 // Is the current user an assigned moderator for the selected debate?
 const isAssignedMod = selectedDebate &&
 (isCEO || (isEditor && selectedDebate.assignedMods && selectedDebate.assignedMods.includes(user?.uid)))

 // ── DEBATE CHAT VIEW ──────────────────────────────────────
 if (selectedDebate) {
 return (
 <div className="debates-container1">
 <div className="homepage-nav-sticky">
 <nav className="homepage-nav-inner">
 <Link to="/" className="homepage-nav-link">Home</Link>
 <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
 <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
 <Link to="/articles" className="homepage-nav-link">Articles</Link>
 <Link to="/debates" className="homepage-nav-link homepage-nav-link-active">Debates</Link>
 <Link to="/source" className="homepage-nav-link">Sources</Link>
 <div className="articles-auth-area">
 {isLoggedIn ? (
 <div className="articles-user-info" onClick={() => history.push('/profile')} style={{cursor:'pointer'}}>
 <img src={user.photoURL} alt="profile" className="articles-user-avatar" />
 {userRole && <span className="articles-user-role">{userRole}</span>}
 </div>
 ) : (
 <button onClick={signInWithGoogle} className="articles-auth-btn">Sign in with Google</button>
 )}
 </div>
 </nav>
 </div>

 <div className="debates-chat-page">
 <button className="debates-back-btn" onClick={() => setSelectedDebate(null)}>← Back to Debates</button>

 <div className="debates-chat-header">
 <h1 className="debates-chat-title">DEBATES</h1>
 <div className="debates-chat-subtitle">{selectedDebate.title}</div>
 </div>

 <div className="debates-chat-window">
 {messages.length === 0 && (
 <p className="debates-chat-empty">No messages yet. Be the first to share your stance!</p>
 )}
 {messages.map((msg, i) => {
 const isOwn = isLoggedIn && msg.authorUid === user.uid
 return (
 <div key={msg.id} className={`debates-msg-row ${isOwn ? 'debates-msg-own' : 'debates-msg-other'} ${msg.isModNote ? 'debates-msg-mod' : ''}`}>
 {!isOwn && <img src={msg.authorPhoto || '/default-avatar.png'} alt={msg.authorName} className="debates-msg-avatar" />}
 <div className="debates-msg-bubble-wrap">
 <div className="debates-msg-author">{msg.authorName}{msg.isModNote && ' Moderator'}</div>
 <div className={`debates-msg-bubble ${isOwn ? 'debates-msg-bubble-own' : ''} ${msg.isModNote ? 'debates-msg-bubble-mod' : ''}`}>
 {msg.text}
 </div>
 <div className="debates-msg-actions">
 <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="debates-msg-report">Report</a>
 {(isEditor || isCEO) && (
 <button className="debates-msg-delete" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
 )}
 </div>
 </div>
 {isOwn && <img src={user.photoURL} alt={user.displayName} className="debates-msg-avatar" />}
 </div>
 )
 })}
 <div ref={messagesEndRef} />
 </div>

 {/* Moderator controls */}
 {isAssignedMod && (
 <div className="debates-mod-area">
 <div className="debates-mod-controls">
 {/* Mod note button */}
 <button
 className="debates-mod-btn"
 onClick={() => setShowModBox(v => !v)}
 title="Add moderator note"
 ></button>

 {/* Stop debate */}
 {selectedDebate.status !== 'stopped' && (
 <button className="debates-stop-btn" onClick={handleStopDebate} title="Stop this debate">
 Stop Debate
 </button>
 )}

 {/* After stopped: Move to Past or Delete */}
 {selectedDebate.status === 'stopped' && (
 <>
 <button className="debates-past-btn" onClick={() => handleMoveToPast(selectedDebate.id)}>
 Move to Past Debates
 </button>
 <button className="debates-delete-btn-red" onClick={() => handleDeleteDebate(selectedDebate.id)}>
 Delete Debate
 </button>
 </>
 )}
 </div>

 {showModBox && (
 <div className="debates-mod-box">
 <textarea
 className="debates-mod-input"
 placeholder="Write a moderator note..."
 value={modNote}
 onChange={e => setModNote(e.target.value)}
 />
 <div className="debates-mod-box-btns">
 <button className="debates-send-btn" onClick={handleSendModNote}>Post Note</button>
 <button className="debates-cancel-btn" onClick={() => setShowModBox(false)}>Cancel</button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Stopped banner */}
 {selectedDebate.status === 'stopped' && (
 <div className="debates-stopped-banner">
 This debate has been stopped by a moderator.
 {isAssignedMod && ' Use the controls above to move it or delete it.'}
 </div>
 )}

 {/* Message input - disabled when stopped */}
 {isLoggedIn ? (
 <div className="debates-input-row" style={{opacity: selectedDebate.status === 'stopped' ? 0.4 : 1}}>
 <img src={user.photoURL} alt="you" className="debates-msg-avatar" />
 <input
 className="debates-msg-input"
 placeholder={selectedDebate.status === 'stopped' ? 'This debate has been stopped.' : 'Write your stance...'}
 value={newMessage}
 onChange={e => setNewMessage(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && !selectedDebate.status && handleSendMessage()}
 disabled={selectedDebate.status === 'stopped'}
 />
 <button className="debates-send-btn" onClick={handleSendMessage} disabled={selectedDebate.status === 'stopped'}>Send</button>
 </div>
 ) : (
 <div className="debates-login-prompt-chat">
 <button onClick={signInWithGoogle} className="debates-google-btn">Sign in with Google to join the debate</button>
 </div>
 )}
 </div>
 </div>
 )
 }

 // ── MAIN DEBATES PAGE ─────────────────────────────────────
 return (
 <div className="debates-container1">
 <Helmet>
 <title>Debates - PoliPatch</title>
 <meta property="og:title" content="Debates - PoliPatch" />
 </Helmet>

 {/* NAVBAR */}
 <div className="homepage-nav-sticky">
 <nav className="homepage-nav-inner">
 <Link to="/" className="homepage-nav-link">Home</Link>
 <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
 <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
 <Link to="/articles" className="homepage-nav-link">Articles</Link>
 <Link to="/debates" className="homepage-nav-link homepage-nav-link-active">Debates</Link>
 <Link to="/source" className="homepage-nav-link">Sources</Link>
 <div className="articles-auth-area">
 {isLoggedIn ? (
 <div className="articles-user-info" onClick={() => history.push('/profile')} style={{cursor:'pointer'}}>
 <img src={user.photoURL} alt="profile" className="articles-user-avatar" />
 {userRole && <span className="articles-user-role">{userRole}</span>}
 </div>
 ) : (
 <button onClick={signInWithGoogle} className="articles-auth-btn">Sign in with Google</button>
 )}
 </div>
 </nav>
 </div>

 <div className="debates-main">

 {/* HERO */}
 <div className="debates-hero">
 <h1 className="debates-hero-title">DEBATES</h1>
 <div className="debates-hero-subtitle">PoliPatch</div>
 </div>

 {/* GUIDELINES */}
 <div className="debates-guidelines-section">
 <h2 className="debates-guidelines-title">Debating Guidelines</h2>
 <div className="debates-guidelines-top">
 <div className="debates-guidelines-left-col">
 <p><strong>1). Be Respectful</strong>: Treat all participants with respect. Personal attacks, harassment, hate speech, or discriminatory language will not be tolerated. Critique ideas, not individuals.</p>
 <p><strong>2). Engage in Good Faith</strong>: Debate with the intention to understand and challenge ideas constructively, not to provoke or "win" at all costs. Misrepresenting others' arguments or debating dishonestly undermines meaningful discussion.</p>
 <p><strong>3). Support Claims with Evidence</strong>: Whenever possible, back up arguments with credible sources, data, or logical reasoning. Opinions are welcome, but evidence strengthens debate.</p>
 <p><strong>4). Stay On Topic</strong>: Keep responses relevant to the debate prompt or discussion thread. Off-topic comments may be removed to maintain clarity and focus.</p>
 </div>
 <img
 src="/library7408106128012119-osu-700w.png"
 alt="library"
 className="debates-guidelines-img-right"
 />
 </div>
 <div className="debates-guidelines-bottom">
 <img
 src="/people6545894128012119-zqq-700w.png"
 alt="people debating"
 className="debates-guidelines-img-left"
 />
 <div className="debates-guidelines-right-col">
 <p><strong>5). Acknowledge Complexity</strong>: Most political and social issues are nuanced. Participants are encouraged to recognize multiple perspectives and avoid oversimplification.</p>
 <p><strong>6). Use the "Fact Drop" Responsibly</strong>: The fact drop feature should be used to add verified information, not to overwhelm or dismiss others. Sources should be reliable and clearly cited.</p>
 <p><strong>7). Respect Moderation</strong>: Moderators and editors may remove content that violates guidelines or pause debates if discussions become unproductive. Repeated violations may result in restricted participation.</p>
 <p><strong>8). Report, Don't Retaliate</strong>: If you encounter content that violates these guidelines, use the report feature rather than responding aggressively.</p>
 </div>
 </div>
 <p className="debates-guidelines-footer">By participating in PoliPatch debates, you agree to uphold these standards and contribute to a space that values dialogue, learning, and a true patchwork of perspectives.</p>
 </div>

 {/* START A DEBATE */}
 <div className="debates-start-section">
 <h2 className="debates-start-title">Start a Debate</h2>
 {!isLoggedIn ? (
 <p className="debates-empty">
 <button onClick={signInWithGoogle} className="debates-google-btn">Sign in with Google</button> to propose a debate topic.
 </p>
 ) : (
 <div className="debates-create-form">
 <div className="debates-form-row">
 <div className="debates-form-title-box">
 <input
 className="debates-form-input"
 placeholder="Topic / Title *"
 value={newDebateTitle}
 onChange={e => setNewDebateTitle(e.target.value)}
 />
 </div>
 </div>
 <textarea
 className="debates-form-input debates-form-textarea"
 placeholder="Write your stance or description..."
 value={newDebateDesc}
 onChange={e => setNewDebateDesc(e.target.value)}
 />
 {isCEO && (
 <div className="debates-type-select">
 <label>
 <input type="radio" value="current" checked={newDebateType === 'current'} onChange={() => setNewDebateType('current')} />
 {' '}Current Debate
 </label>
 <label>
 <input type="radio" value="past" checked={newDebateType === 'past'} onChange={() => setNewDebateType('past')} />
 {' '}Past Debate
 </label>
 </div>
 )}
 <div className="debates-form-btns">
 <button className="debates-send-btn" onClick={handleCreateDebate}>
 {isCEO ? 'Create Debate' : 'Submit for Review'}
 </button>
 </div>
 {!isCEO && <p className="debates-form-note">Your topic will be reviewed by our team before going live.</p>}
 </div>
 )}
 </div>

 {/* CURRENT DEBATES */}
 <div className="debates-current-section">
 <h2 className="debates-section-title">CURRENT DEBATES</h2>
 {currentDebates.length === 0 ? (
 <p className="debates-empty">No current debates yet.</p>
 ) : (
 <div className="debates-list">
 {currentDebates.map(debate => (
 <div key={debate.id} className="debates-list-row" onClick={() => setSelectedDebate(debate)}>
 <div className="debates-list-left">
 <div className="debates-list-topic">{debate.title}</div>
 </div>
 <div className="debates-list-right">
 <div className="debates-list-desc">{debate.description}</div>
 </div>
 {isCEO && (
 <button className="debates-delete-btn" onClick={e => { e.stopPropagation(); handleDeleteDebate(debate.id) }}>✕</button>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* HOT DEBATES */}
 <div className="debates-hot-section">
 <h2 className="debates-hot-title">Past Debates</h2>
 {hotDebates.length === 0 ? (
 <p className="debates-empty" style={{color:'#888', textAlign:'center', paddingBottom:'40px'}}>No past debates yet.</p>
 ) : (
 <div className="debates-hot-grid">
 {hotDebates.map(debate => (
 <div key={debate.id} className="debates-hot-card" onClick={() => setSelectedDebate(debate)}>
 <div className="debates-hot-card-title">{debate.title}</div>
 <div className="debates-hot-card-desc">{debate.description}</div>
 {isCEO && (
 <button className="debates-delete-btn" onClick={e => { e.stopPropagation(); handleDeleteDebate(debate.id) }}>✕</button>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

        {/* REPORT SECTION */}
        {!isCEO && (
          <div className="debates-report-section">
            <h2 className="debates-report-title">Report</h2>
            <p className="debates-report-desc"><strong>Report, Don't Retaliate</strong>: If you encounter content that violates these guidelines, use the report feature rather than responding aggressively.</p>
            <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="debates-report-btn">Report</a>
          </div>
        )}

 </div>
 </div>
 )
}

export default Debates