import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import {
 collection, getDocs, updateDoc, deleteDoc, addDoc,
 doc, query, where, serverTimestamp, setDoc, getDoc
} from 'firebase/firestore'

import './profile.css'
import './homepage.css'

const Profile = () => {
 const { user, userRole, isCEO, isEditor, isLoggedIn, signInWithGoogle, logout } = useAuth()
 const history = useHistory()

 const [allUsers, setAllUsers] = useState([])
 const [myArticles, setMyArticles] = useState([])
 const [assignedArticles, setAssignedArticles] = useState([])
 const [pendingArticles, setPendingArticles] = useState([])
 const [publishedArticles, setPublishedArticles] = useState([])
 const [editingArticle, setEditingArticle] = useState(null) // { id, title, article_body }
 const [debateRequests, setDebateRequests] = useState([])
 const [allDebates, setAllDebates] = useState([])
 const [bio, setBio] = useState('')
 const [contact, setContact] = useState('')
 const [volunteerHours, setVolunteerHours] = useState(0)
 const [editingHours, setEditingHours] = useState(false)
 const [hoursInput, setHoursInput] = useState('')
 const [editingProfile, setEditingProfile] = useState(false)
 const [saveStatus, setSaveStatus] = useState(null)

 // Load user's own profile data
 useEffect(() => {
 if (!user) return
 const loadProfile = async () => {
 const userRef = doc(db, 'users', user.uid)
 const snap = await getDoc(userRef)
 if (snap.exists()) {
 setBio(snap.data().bio || '')
 setContact(snap.data().contact || '')
 setVolunteerHours(snap.data().volunteerHours || 0)
 setHoursInput(snap.data().volunteerHours || 0)
 }
 }
 loadProfile()
 }, [user])

 // Load all users (CEO only)
 useEffect(() => {
 if (!isCEO) return
 const loadUsers = async () => {
 const snap = await getDocs(collection(db, 'users'))
 setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
 }
 loadUsers()
 }, [isCEO])

 // Load all debates for CEO assignment
 useEffect(() => {
 if (!isCEO) return
 const loadDebates = async () => {
 const snap = await getDocs(collection(db, 'debates'))
 setAllDebates(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.type === 'current'))
 }
 loadDebates()
 }, [isCEO])

 // Load debate requests (CEO only)
 useEffect(() => {
 if (!isCEO) return
 const loadRequests = async () => {
 const snap = await getDocs(collection(db, 'debateRequests'))
 setDebateRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === 'pending'))
 }
 loadRequests()
 }, [isCEO])

 // Load all pending articles (CEO only)
 useEffect(() => {
 if (!isCEO) return
 const loadPending = async () => {
 const snap = await getDocs(collection(db, 'articles'))
 const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
 setPendingArticles(all.filter(a => a.status !== 'published'))
 setPublishedArticles(all.filter(a => a.status === 'published'))
 }
 loadPending()
 }, [isCEO])

 // Load my submitted articles
 useEffect(() => {
 if (!user) return
 const loadMyArticles = async () => {
 const q = query(collection(db, 'articles'), where('authorUid', '==', user.uid))
 const snap = await getDocs(q)
 setMyArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
 }
 loadMyArticles()
 }, [user])

 // Load assigned articles (editor only)
 useEffect(() => {
 if (!isEditor || isCEO || !user) return
 const loadAssigned = async () => {
 const q = query(collection(db, 'articles'), where('assignedTo', '==', user.uid))
 const snap = await getDocs(q)
 setAssignedArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
 }
 loadAssigned()
 }, [isEditor, isCEO, user])

 const handleSaveHours = async () => {
 const hours = parseFloat(hoursInput) || 0
 await setDoc(doc(db, 'users', user.uid), { volunteerHours: hours }, { merge: true })
 setVolunteerHours(hours)
 setEditingHours(false)
 }

 const handleSaveProfile = async () => {
 setSaveStatus('saving')
 try {
 await setDoc(doc(db, 'users', user.uid), { bio, contact }, { merge: true })
 setSaveStatus('saved')
 setEditingProfile(false)
 setTimeout(() => setSaveStatus(null), 2000)
 } catch {
 setSaveStatus('error')
 }
 }

 const handlePublish = async (articleId) => {
 const { serverTimestamp: st } = await import('firebase/firestore')
 await updateDoc(doc(db, 'articles', articleId), { status: 'published', publishedAt: serverTimestamp() })
 const article = pendingArticles.find(a => a.id === articleId)
 setPendingArticles(prev => prev.filter(a => a.id !== articleId))
 setPublishedArticles(prev => [...prev, { ...article, status: 'published' }])
 }

 const handleRemoveArticle = async (articleId) => {
 if (!window.confirm('Remove this article from the site?')) return
 await deleteDoc(doc(db, 'articles', articleId))
 setPendingArticles(prev => prev.filter(a => a.id !== articleId))
 setPublishedArticles(prev => prev.filter(a => a.id !== articleId))
 }

 const handleSaveEdit = async () => {
 if (!editingArticle) return
 await updateDoc(doc(db, 'articles', editingArticle.id), {
 title: editingArticle.title,
 article_body: editingArticle.article_body,
 status: 'edited',
 })
 setAssignedArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...editingArticle, status: 'edited' } : a))
 setEditingArticle(null)
 }

 const handleAssign = async (articleId, editorId) => {
 const editor = allUsers.find(u => u.id === editorId)
 await updateDoc(doc(db, 'articles', articleId), {
 status: 'assigned',
 assignedTo: editorId,
 assignedToName: editor?.displayName || editor?.email || 'Unknown',
 })
 setPendingArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: 'assigned', assignedToName: editor?.displayName || editor?.email } : a))
 }

 const handleAssignModerator = async (debateId, editorId) => {
 const debate = allDebates.find(d => d.id === debateId)
 const current = debate?.assignedMods || []
 if (current.includes(editorId)) return
 await updateDoc(doc(db, 'debates', debateId), {
 assignedMods: [...current, editorId]
 })
 setAllDebates(prev => prev.map(d => d.id === debateId ? { ...d, assignedMods: [...(d.assignedMods || []), editorId] } : d))
 }

 const handleRemoveModerator = async (debateId, editorId) => {
 const debate = allDebates.find(d => d.id === debateId)
 const updated = (debate?.assignedMods || []).filter(id => id !== editorId)
 await updateDoc(doc(db, 'debates', debateId), { assignedMods: updated })
 setAllDebates(prev => prev.map(d => d.id === debateId ? { ...d, assignedMods: updated } : d))
 }

 const handleApproveDebate = async (request, type) => {
 await addDoc(collection(db, 'debates'), {
 title: request.title,
 description: request.description,
 type: type,
 createdAt: serverTimestamp(),
 createdBy: request.submittedBy,
 })
 await updateDoc(doc(db, 'debateRequests', request.id), { status: 'approved' })
 setDebateRequests(prev => prev.filter(r => r.id !== request.id))
 }

 const handleRejectDebate = async (requestId) => {
 await updateDoc(doc(db, 'debateRequests', requestId), { status: 'rejected' })
 setDebateRequests(prev => prev.filter(r => r.id !== requestId))
 }

 const handleRoleChange = async (userId, newRole) => {
 await updateDoc(doc(db, 'users', userId), { role: newRole })
 setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
 }

 const handleRemoveUser = async (userId) => {
 if (!window.confirm('Are you sure you want to remove this user?')) return
 await deleteDoc(doc(db, 'users', userId))
 setAllUsers(prev => prev.filter(u => u.id !== userId))
 }

 const statusColor = (s) => {
 if (s === 'published') return '#2e7d32'
 if (s === 'pending') return '#e65100'
 if (s === 'assigned') return '#1565c0'
 if (s === 'edited') return '#6a1b9a'
 if (s === 'rejected') return '#c62828'
 return '#000'
 }

 if (!isLoggedIn) {
 return (
 <div className="profile-container">
 <div className="homepage-nav-sticky">
 <nav className="homepage-nav-inner">
 <Link to="/" className="homepage-nav-link">Home</Link>
 <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
 <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
 <Link to="/articles" className="homepage-nav-link">Articles</Link>
 <Link to="/debates" className="homepage-nav-link">Debates</Link>
 <Link to="/source" className="homepage-nav-link">Sources</Link>
 </nav>
 </div>
 <div className="profile-not-logged-in">
 <h1 className="profile-big-title">PoliPatch</h1>
 <p className="profile-subtitle">Sign in to view your profile</p>
 <button onClick={signInWithGoogle} className="profile-google-btn">
 <img src="https://www.google.com/favicon.ico" alt="Google" width="20" />
 Sign in with Google
 </button>
 </div>
 </div>
 )
 }

 return (
 <div className="profile-container">
 <Helmet>
 <title>Profile - PoliPatch</title>
 </Helmet>

 {/* NAVBAR */}
 <div className="homepage-nav-sticky">
 <nav className="homepage-nav-inner">
 <Link to="/" className="homepage-nav-link">Home</Link>
 <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
 <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
 <Link to="/articles" className="homepage-nav-link">Articles</Link>
 <Link to="/debates" className="homepage-nav-link">Debates</Link>
 <Link to="/source" className="homepage-nav-link">Sources</Link>
 <div className="articles-auth-area">
 <div className="articles-user-info" style={{cursor:'pointer'}}>
 <img src={user.photoURL} alt="profile" className="articles-user-avatar" />
 {userRole && <span className="articles-user-role">{userRole}</span>}
 </div>
 </div>
 </nav>
 </div>

 <div className="profile-page">

 {/* HERO HEADER */}
 <div className="profile-hero">
 <img src={user.photoURL} alt="avatar" className="profile-avatar" />
 <div className="profile-hero-info">
 <h1 className="profile-name">{user.displayName}</h1>
 <span className="profile-role-badge">{userRole}</span>
 <p className="profile-email">{user.email}</p>
 </div>
 </div>

 {/* ABOUT & CONTACT */}
 <div className="profile-section">
 <h2 className="profile-section-title">About Me</h2>
 {editingProfile ? (
 <div className="profile-edit-form">
 <textarea
 className="profile-input"
 placeholder="Tell us about yourself..."
 value={bio}
 onChange={e => setBio(e.target.value)}
 />
 <input
 className="profile-input"
 placeholder="Contact info (email, social, etc.)"
 value={contact}
 onChange={e => setContact(e.target.value)}
 />
 <div className="profile-edit-btns">
 <button className="profile-save-btn" onClick={handleSaveProfile}>
 {saveStatus === 'saving' ? 'Saving...' : 'Save'}
 </button>
 <button className="profile-cancel-btn" onClick={() => setEditingProfile(false)}>Cancel</button>
 </div>
 {saveStatus === 'saved' && <p className="profile-saved-msg"> Saved!</p>}
 </div>
 ) : (
 <div className="profile-about-display">
 <p className="profile-bio">{bio || 'No bio yet.'}</p>
 {contact && <p className="profile-contact"> {contact}</p>}
 <button className="profile-edit-btn" onClick={() => setEditingProfile(true)}>Edit Profile</button>
 </div>
 )}
 </div>

 {/* VOLUNTEER HOURS */}
 <div className="profile-section">
 <h2 className="profile-section-title">Volunteer Hours</h2>
 <div className="profile-hours-display">
 <div className="profile-hours-number">{volunteerHours}</div>
 <div className="profile-hours-stars">
 {Array.from({ length: Math.floor(volunteerHours) }).map((_, i) => (
 <span key={i} className="profile-star"></span>
 ))}
 {volunteerHours % 1 >= 0.5 && <span className="profile-star-empty"></span>}
 </div>
 </div>
 {editingHours ? (
 <div className="profile-hours-edit">
 <input
 className="profile-hours-input"
 type="number"
 min="0"
 step="0.5"
 value={hoursInput}
 onChange={e => setHoursInput(e.target.value)}
 />
 <button className="profile-hours-save-btn" onClick={handleSaveHours}>Save</button>
 <button className="profile-hours-save-btn" onClick={() => setEditingHours(false)}>Cancel</button>
 </div>
 ) : (
 <button className="profile-edit-btn" style={{marginTop: '12px'}} onClick={() => setEditingHours(true)}>Update Hours</button>
 )}
 </div>

 {/* MY ARTICLES */}
 <div className="profile-section">
 <h2 className="profile-section-title">My Articles</h2>
 {myArticles.length === 0 ? (
 <p className="profile-empty">No articles submitted yet.</p>
 ) : (
 <div className="profile-articles-list">
 {myArticles.map(a => (
 <div key={a.id} className="profile-article-card">
 <div className="profile-article-title">{a.title}</div>
 <span className="profile-article-status" style={{color: statusColor(a.status)}}>● {a.status}</span>
 {a.assignedToName && <span className="profile-article-assigned">Assigned to: {a.assignedToName}</span>}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* EDITOR: ASSIGNED ARTICLES */}
 {isEditor && !isCEO && (
 <div className="profile-section">
 <h2 className="profile-section-title">Assigned to Me</h2>
 {assignedArticles.length === 0 ? (
 <p className="profile-empty">No articles assigned yet.</p>
 ) : (
 <div className="profile-articles-list">
 {assignedArticles.map(a => (
 <div key={a.id} className="profile-article-card">
 {editingArticle && editingArticle.id === a.id ? (
 <div className="profile-edit-form">
 <input
 className="profile-input"
 value={editingArticle.title}
 onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value }))}
 placeholder="Title"
 />
 <textarea
 className="profile-input"
 style={{height: '300px', lineHeight: '1.6'}}
 value={editingArticle.article_body}
 onChange={e => setEditingArticle(p => ({ ...p, article_body: e.target.value }))}
 placeholder="Article body"
 />
 <div className="profile-edit-btns">
 <button className="profile-save-btn" onClick={handleSaveEdit}>Save Changes</button>
 <button className="profile-cancel-btn" onClick={() => setEditingArticle(null)}>Cancel</button>
 </div>
 </div>
 ) : (
 <>
 <div className="profile-article-title">{a.title}</div>
 <div className="profile-article-body-preview">{a.article_body?.substring(0, 150)}...</div>
 <span className="profile-article-status" style={{color: statusColor(a.status)}}>● {a.status}</span>
 <div style={{display:'flex', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
 <button className="profile-edit-btn" onClick={() => setEditingArticle({ id: a.id, title: a.title, article_body: a.article_body })}>
 ✏️ Edit Article
 </button>
 {a.status === 'assigned' && (
 <button className="profile-mark-edited-btn" onClick={async () => {
 await updateDoc(doc(db, 'articles', a.id), { status: 'edited' })
 setAssignedArticles(prev => prev.map(art => art.id === a.id ? { ...art, status: 'edited' } : art))
 }}>Mark as Edited </button>
 )}
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* CEO: ALL SUBMITTED ARTICLES */}
 {isCEO && (
 <div className="profile-section">
 <h2 className="profile-section-title">All Submitted Articles</h2>
 {pendingArticles.length === 0 ? (
 <p className="profile-empty">No articles to review.</p>
 ) : (
 <div className="profile-articles-list">
 {pendingArticles.map(a => (
 <div key={a.id} className="profile-article-card">
 <div className="profile-article-title">{a.title}</div>
 <div className="profile-article-body-preview">{a.article_body?.substring(0, 120)}...</div>
 <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', marginTop:'8px'}}>
 <span className="profile-article-status" style={{color: statusColor(a.status)}}>● {a.status}</span>
 {a.assignedToName && <span className="profile-article-assigned">Assigned to: {a.assignedToName}</span>}
 </div>
 <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
 <select
 className="profile-role-select"
 defaultValue=""
 onChange={e => { if (e.target.value) handleAssign(a.id, e.target.value) }}
 >
 <option value="" disabled>Assign to editor...</option>
 {allUsers.filter(u => u.role === 'editor' || u.role === 'ceo').map(u => (
 <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
 ))}
 </select>
 <button className="profile-mark-edited-btn" style={{background:'#e8f5e9', color:'#2e7d32'}} onClick={() => handlePublish(a.id)}>
 Publish
 </button>
 <button className="profile-remove-btn" onClick={() => handleRemoveArticle(a.id)}>
 Remove
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* CEO: PUBLISHED ARTICLES */}
 {isCEO && publishedArticles.length > 0 && (
 <div className="profile-section">
 <h2 className="profile-section-title">Published Articles</h2>
 <div className="profile-articles-list">
 {publishedArticles.map(a => (
 <div key={a.id} className="profile-article-card">
 <div className="profile-article-title">{a.title}</div>
 <span className="profile-article-status" style={{color: statusColor('published')}}>● published</span>
 <div style={{marginTop:'10px'}}>
 <button className="profile-remove-btn" onClick={() => handleRemoveArticle(a.id)}>
 Remove from site
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* CEO: ASSIGN MODERATORS TO DEBATES */}
 {isCEO && allDebates.length > 0 && (
 <div className="profile-section">
 <h2 className="profile-section-title">Assign Moderators to Debates</h2>
 <div className="profile-articles-list">
 {allDebates.map(debate => (
 <div key={debate.id} className="profile-article-card">
 <div className="profile-article-title">{debate.title}</div>
 <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
 <select
 className="profile-role-select"
 defaultValue=""
 onChange={e => { if (e.target.value) handleAssignModerator(debate.id, e.target.value) }}
 >
 <option value="" disabled>Assign moderator...</option>
 {allUsers.filter(u => u.role === 'editor' || u.role === 'ceo').map(u => (
 <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
 ))}
 </select>
 </div>
 {debate.assignedMods && debate.assignedMods.length > 0 && (
 <div style={{marginTop:'10px'}}>
 <div className="profile-article-assigned">Assigned moderators:</div>
 {debate.assignedMods.map(modId => {
 const mod = allUsers.find(u => u.id === modId)
 return mod ? (
 <div key={modId} style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'6px'}}>
 <span className="profile-article-assigned">{mod.displayName || mod.email}</span>
 <button className="profile-remove-btn" style={{padding:'2px 10px', fontSize:'12px'}} onClick={() => handleRemoveModerator(debate.id, modId)}>Remove</button>
 </div>
 ) : null
 })}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* CEO: DEBATE REQUESTS */}
 {isCEO && debateRequests.length > 0 && (
 <div className="profile-section">
 <h2 className="profile-section-title">Debate Topic Requests</h2>
 <div className="profile-articles-list">
 {debateRequests.map(r => (
 <div key={r.id} className="profile-article-card">
 <div className="profile-article-title">{r.title}</div>
 {r.description && <div className="profile-article-body-preview">{r.description}</div>}
 <div className="profile-article-assigned">Submitted by: {r.submittedBy}</div>
 <div style={{display:'flex', gap:'10px', marginTop:'12px', flexWrap:'wrap'}}>
 <button className="profile-mark-edited-btn" style={{background:'#e8f5e9', color:'#2e7d32'}} onClick={() => handleApproveDebate(r, 'current')}>
 Approve
 </button>
 <button className="profile-mark-edited-btn" style={{background:'#f3e5f5', color:'#6a1b9a'}} onClick={() => handleApproveDebate(r, 'past')}>
 Add to Past Debates
 </button>
 <button className="profile-remove-btn" onClick={() => handleRejectDebate(r.id)}>
 Reject
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* CEO: ALL MEMBERS */}
 {isCEO && (
 <div className="profile-section">
 <h2 className="profile-section-title">All Members</h2>
 <div className="profile-members-list">
 {allUsers.map(u => (
 <div key={u.id} className="profile-member-card">
 <div className="profile-member-info">
 {u.photoURL && <img src={u.photoURL} alt="avatar" className="profile-member-avatar" />}
 <div>
 <div className="profile-member-name">{u.displayName || 'Unknown'}</div>
 <div className="profile-member-email">{u.email}</div>
 {u.bio && <div className="profile-member-bio">{u.bio}</div>}
 {u.contact && <div className="profile-member-contact"> {u.contact}</div>}
 </div>
 </div>
 <div className="profile-member-actions">
 <select
 className="profile-role-select"
 value={u.role}
 onChange={e => handleRoleChange(u.id, e.target.value)}
 >
 <option value="user">User</option>
 <option value="editor">Editor</option>
 <option value="ceo">CEO</option>
 </select>
 <button className="profile-remove-btn" onClick={() => handleRemoveUser(u.id)}>Remove</button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* REPORT SECTION */}
 {!isCEO && (
   <div className="profile-section profile-report-section">
     <h2 className="profile-report-title">Report</h2>
     <p className="profile-report-desc"><strong>Report, Don't Retaliate</strong>: If you encounter content that violates these guidelines, use the report feature rather than responding aggressively.</p>
     <a href="https://docs.google.com/forms/d/e/1FAIpQLSeqT5I7IM6z3m2H6qV-oWbVj6802AnRfTZa7lyUQDvnmOkuhA/viewform" target="_blank" rel="noopener noreferrer" className="profile-report-btn">Report</a>
   </div>
 )}

 {/* SIGN OUT */}
 <div className="profile-signout-section">
 <button onClick={logout} className="profile-signout-btn">Sign Out</button>
 </div>

 </div>
 </div>
 )
}

export default Profile