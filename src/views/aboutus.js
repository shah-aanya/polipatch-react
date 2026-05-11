import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query, setDoc, getDoc
} from 'firebase/firestore'

import './aboutus.css'

const DEFAULT_ABOUT_CONTENT = {
  missionText: 'PoliPatch is a patchwork of ideas and viewpoints—empowering teens of every political background to share their voices, debate respectfully, and take real action on the issues that matter most.',
  tagline: 'A patchwork of ideas and viewpoints',
  intro1: 'PoliPatch is an online platform created for politically engaged teenagers across the political spectrum. It provides a space for young people to share their opinions, publish articles, and participate in thoughtful, respectful discussions about current political issues.',
  intro2: 'Users can create personalized profiles, explore different viewpoints, and engage in moderated debate threads that prioritize civil and appropriate dialogue. In addition to community-driven content, PoliPatch features posts from dedicated authors and shares information about protests, events, and civic engagement opportunities, allowing teens to turn political interest into real-world action.',
  getInvolvedIntro: "PoliPatch is all about giving teenagers a voice in politics and helping you take action in ways that fit your interests. Here's how you can get involved:",
  getInvolved1: 'Join the Debates: Engage in moderated debates with other teens on current political topics. Share your perspective, learn from others, and practice respectful dialogue. Every debate is monitored to ensure that conversations stay civil and productive',
  getInvolved2: 'Write and Publish Articles: Have an idea or opinion you want to share? Write articles on issues you care about and publish them on PoliPatch. You can write about local politics, global events, or personal experiences that relate to civic engagement.',
  getInvolved3: "Become an Editor: Interested in helping others share their ideas? Fill out the \"Become an Editor\" Google Form to apply. If accepted, you'll review and edit submissions from other teens, helping ensure articles are polished and ready to share with the PoliPatch community.",
  getInvolved4: 'Volunteer Opportunities: The more you get involved—writing articles, joining debates, or contributing to the resource section—the more you can make an impact. Show off your contributions and help strengthen the PoliPatch community!',
  getInvolved5: 'Customize Your Profile: Create your profile to showcase your interests, political leanings, and contributions. Add a profile picture, background, and short biography to let others know who you are.',
  backgroundImg: '/screenshot20251205at12541pm22035-6ei-1500w.png',
  smallImg: '/tempimagelqgknm12035-d9sg-600w.png',
  sideImg: '/rectangle2035-mpc-500w.png',
}

const ABOUTUS = (props) => {
  const { user, userRole, isCEO, isLoggedIn, signInWithGoogle } = useAuth()
  const history = useHistory()

  const [teamMembers, setTeamMembers] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [editingMember, setEditingMember] = useState(null)
  const [addingMember, setAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', role: '', description: '', photoURL: '' })
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [pageContent, setPageContent] = useState(DEFAULT_ABOUT_CONTENT)
  const [editingContent, setEditingContent] = useState(false)
  const [contentDraft, setContentDraft] = useState(DEFAULT_ABOUT_CONTENT)
  const [contentImgProgress, setContentImgProgress] = useState({})

  const handlePhotoUpload = (file, onURLReady) => {
    if (!file) return
    // Warn if file is too large (Firestore doc limit is 1MB)
    if (file.size > 800 * 1024) {
      alert('Please use an image under 800KB. Tip: compress it at tinypng.com first.')
      return
    }
    setUploadProgress(0)
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    }
    reader.onload = () => {
      onURLReady(reader.result) // base64 data URL
      setUploadProgress(null)
    }
    reader.onerror = () => { alert('Failed to read image.'); setUploadProgress(null) }
    reader.readAsDataURL(file)
  }

  // Load page content from Firestore
  useEffect(() => {
    const loadContent = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'aboutus'))
        if (snap.exists()) {
          const saved = snap.data()
          const merged = { ...DEFAULT_ABOUT_CONTENT, ...saved }
          setPageContent(merged)
          setContentDraft(merged)
        }
      } catch (e) {
        console.error('Failed to load content:', e)
      }
    }
    loadContent()
  }, [])

  const handleContentImgUpload = (field, file) => {
    if (!file) return
    if (file.size > 800 * 1024) { alert('Image must be under 800KB. Try tinypng.com.'); return }
    setContentImgProgress(p => ({ ...p, [field]: 0 }))
    const reader = new FileReader()
    reader.onprogress = e => { if (e.lengthComputable) setContentImgProgress(p => ({ ...p, [field]: Math.round(e.loaded/e.total*100) })) }
    reader.onload = () => { setContentDraft(p => ({ ...p, [field]: reader.result })); setContentImgProgress(p => ({ ...p, [field]: null })) }
    reader.onerror = () => { alert('Failed to read image.'); setContentImgProgress(p => ({ ...p, [field]: null })) }
    reader.readAsDataURL(file)
  }

  const handleSaveContent = async () => {
    setSaving(true)
    try {
      // Only save text fields to Firestore (images as base64 are too large)
      // Images that start with / are static paths and safe to save
      const textData = {
        missionText: contentDraft.missionText,
        tagline: contentDraft.tagline,
        intro1: contentDraft.intro1,
        intro2: contentDraft.intro2,
        getInvolvedIntro: contentDraft.getInvolvedIntro,
        getInvolved1: contentDraft.getInvolved1,
        getInvolved2: contentDraft.getInvolved2,
        getInvolved3: contentDraft.getInvolved3,
        getInvolved4: contentDraft.getInvolved4,
        getInvolved5: contentDraft.getInvolved5,
      }
      // Only save image URLs if they're not base64 (static paths are fine)
      if (!contentDraft.backgroundImg.startsWith('data:')) textData.backgroundImg = contentDraft.backgroundImg
      if (!contentDraft.smallImg.startsWith('data:')) textData.smallImg = contentDraft.smallImg
      if (!contentDraft.sideImg.startsWith('data:')) textData.sideImg = contentDraft.sideImg

      await setDoc(doc(db, 'siteContent', 'aboutus'), textData)
      // Apply ALL changes (including base64 images) to live state even if not persisted
      setPageContent({ ...contentDraft })
      setEditingContent(false)
      alert('Text saved! Note: uploaded images will reset on page refresh — use image URLs instead of uploads for permanent images.')
    } catch (e) {
      alert('Error saving: ' + e.message)
      console.error(e)
    }
    setSaving(false)
  }

  // Load team members from Firestore
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const q = query(collection(db, 'teamMembers'), orderBy('order', 'asc'))
        const snap = await getDocs(q)
        setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
        // fallback if no order field yet
        const snap = await getDocs(collection(db, 'teamMembers'))
        setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
      setLoadingTeam(false)
    }
    loadTeam()
  }, [])

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return
    setSaving(true)
    try {
      const docRef = await addDoc(collection(db, 'teamMembers'), {
        ...newMember,
        order: teamMembers.length,
        createdAt: serverTimestamp(),
      })
      setTeamMembers(prev => [...prev, { id: docRef.id, ...newMember, order: prev.length }])
      setNewMember({ name: '', role: '', description: '', photoURL: '' })
      setAddingMember(false)
    } catch (e) {
      alert('Error adding member: ' + e.message)
    }
    setSaving(false)
  }

  const handleUpdateMember = async () => {
    if (!editingMember.name.trim()) return
    setSaving(true)
    try {
      const { id, ...data } = editingMember
      await updateDoc(doc(db, 'teamMembers', id), data)
      setTeamMembers(prev => prev.map(m => m.id === id ? editingMember : m))
      setEditingMember(null)
    } catch (e) {
      alert('Error updating member: ' + e.message)
    }
    setSaving(false)
  }

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Remove this team member?')) return
    await deleteDoc(doc(db, 'teamMembers', memberId))
    setTeamMembers(prev => prev.filter(m => m.id !== memberId))
  }

  return (
    <div className="aboutus-container1">
      <Helmet>
        <title>About Us - PoliPatch</title>
        <meta property="og:title" content="About Us - PoliPatch" />
        <link rel="canonical" href="https://polipatch-copy-ycxznx.teleporthq.app/aboutus" />
        <meta property="og:url" content="https://polipatch-copy-ycxznx.teleporthq.app/aboutus" />
      </Helmet>

      {/* STICKY NAVBAR */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link">Home</Link>
          <Link to="/aboutus" className="homepage-nav-link homepage-nav-link-active">About Us</Link>
          <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
          <Link to="/articles" className="homepage-nav-link">Articles</Link>
          <Link to="/debates" className="homepage-nav-link">Debates</Link>
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

      {/* CEO PAGE CONTENT EDITOR - top of page */}
      {isCEO && (
        <div className="aboutus-content-edit-bar">
          {!editingContent ? (
            <button className="aboutus-team-add-btn" onClick={() => { setContentDraft({...pageContent}); setEditingContent(true) }}>
              Edit Page Content
            </button>
          ) : (
            <div className="aboutus-content-edit-modal">
              <h3 className="aboutus-team-modal-title">Edit Page Content</h3>
              <div className="aboutus-content-scroll-wrap">

              <label className="aboutus-content-label">Mission Text</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.missionText} onChange={e => setContentDraft(p => ({...p, missionText: e.target.value}))} />

              <label className="aboutus-content-label">Tagline</label>
              <input className="aboutus-team-input" value={contentDraft.tagline} onChange={e => setContentDraft(p => ({...p, tagline: e.target.value}))} />

              <label className="aboutus-content-label">Intro Paragraph 1</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.intro1} onChange={e => setContentDraft(p => ({...p, intro1: e.target.value}))} />

              <label className="aboutus-content-label">Intro Paragraph 2</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.intro2} onChange={e => setContentDraft(p => ({...p, intro2: e.target.value}))} />

              <label className="aboutus-content-label" style={{marginTop:'12px',borderTop:'1px solid #eee',paddingTop:'12px'}}>Get Involved — Intro</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolvedIntro} onChange={e => setContentDraft(p => ({...p, getInvolvedIntro: e.target.value}))} />

              <label className="aboutus-content-label">Get Involved — Point 1</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolved1} onChange={e => setContentDraft(p => ({...p, getInvolved1: e.target.value}))} />

              <label className="aboutus-content-label">Get Involved — Point 2</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolved2} onChange={e => setContentDraft(p => ({...p, getInvolved2: e.target.value}))} />

              <label className="aboutus-content-label">Get Involved — Point 3</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolved3} onChange={e => setContentDraft(p => ({...p, getInvolved3: e.target.value}))} />

              <label className="aboutus-content-label">Get Involved — Point 4</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolved4} onChange={e => setContentDraft(p => ({...p, getInvolved4: e.target.value}))} />

              <label className="aboutus-content-label">Get Involved — Point 5</label>
              <textarea className="aboutus-team-input aboutus-content-textarea" value={contentDraft.getInvolved5} onChange={e => setContentDraft(p => ({...p, getInvolved5: e.target.value}))} />

              </div>
              <div className="aboutus-team-modal-btns">
                <button className="aboutus-team-save-btn" onClick={handleSaveContent} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button className="aboutus-team-cancel-btn" onClick={() => setEditingContent(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCALE WRAPPER */}
      <div className="aboutus-scale-shell">
        <div className="aboutus-scale-wrap">
          <div className="aboutus-thq-aboutus-elm">
            <img
              src={pageContent.backgroundImg}
              alt="background"
              className="aboutus-thq-screenshot20251205at12541pm2-elm"
            />
            <span className="aboutus-thq-text-elm15">PoliPatch</span>
            <span className="aboutus-thq-text-elm16">Our Mission</span>
            <span className="aboutus-thq-text-elm17">About Us</span>
            <span className="aboutus-thq-text-elm18">{pageContent.missionText}</span>
            <span className="aboutus-thq-text-elm19">{pageContent.tagline}</span>
            <img
              src={pageContent.smallImg}
              alt="small"
              className="aboutus-thq-temp-imagelqg-knm1-elm"
            />
            <span className="aboutus-thq-text-elm20">HOW YOU CAN<br/>GET INVOLVED</span>
            <div className="aboutus-thq-rectangle4-elm"></div>
            <span className="aboutus-thq-text-elm21">{pageContent.intro1}</span>
            <span className="aboutus-thq-text-elm22">{pageContent.intro2}</span>
            <span className="aboutus-thq-text-elm23">
              <span className="aboutus-thq-text-elm24">{pageContent.getInvolvedIntro}</span>
              <br/><br/>
              <span className="aboutus-thq-text-elm25">1) </span>
              <span className="aboutus-thq-text-elm27">{pageContent.getInvolved1}</span>
              <br/>
              <span className="aboutus-thq-text-elm28">2) </span>
              <span className="aboutus-thq-text-elm30">{pageContent.getInvolved2}</span>
              <br/>
              <span className="aboutus-thq-text-elm31">3) </span>
              <span className="aboutus-thq-text-elm33">{pageContent.getInvolved3}</span>
              <br/>
              <span className="aboutus-thq-text-elm34">4) </span>
              <span className="aboutus-thq-text-elm36">{pageContent.getInvolved4}</span>
              <br/>
              <span className="aboutus-thq-text-elm37">5) </span>
              <span>{pageContent.getInvolved5}</span>
            </span>
            <img
              src={pageContent.sideImg}
              alt="side"
              className="aboutus-thq-rectangle-elm"
            />

            {/* OUR TEAM — dynamic section */}
            <span className="aboutus-thq-text-elm40">Our Team</span>
          </div>
        </div>
      </div>

      {/* TEAM MEMBERS SECTION — outside scale wrapper for full-width flex layout */}
      <div className="aboutus-team-section">

        {isCEO && (
          <div className="aboutus-team-ceo-bar">
            <span className="aboutus-team-ceo-label">CEO: Manage Team</span>
            <button
              className="aboutus-team-add-btn"
              onClick={() => { setAddingMember(true); setEditingMember(null) }}
            >
              + Add Member
            </button>
          </div>
        )}

        {/* ADD MEMBER FORM */}
        {isCEO && addingMember && (
          <div className="aboutus-team-modal-overlay" onClick={() => setAddingMember(false)}>
            <div className="aboutus-team-modal" onClick={e => e.stopPropagation()}>
              <h3 className="aboutus-team-modal-title">Add Team Member</h3>
              <input
                className="aboutus-team-input"
                placeholder="Name *"
                value={newMember.name}
                onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
              />
              <input
                className="aboutus-team-input"
                placeholder="Role (e.g. Co-Founder, Editor)"
                value={newMember.role}
                onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}
              />
              <textarea
                className="aboutus-team-input aboutus-team-textarea"
                placeholder="Short description"
                value={newMember.description}
                onChange={e => setNewMember(p => ({ ...p, description: e.target.value }))}
              />
              <div className="aboutus-team-upload-row">
                <label className="aboutus-team-upload-btn">
                  {newMember.photoURL ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handlePhotoUpload(e.target.files[0], url => setNewMember(p => ({ ...p, photoURL: url })))}
                  />
                </label>
                {uploadProgress !== null && (
                  <div className="aboutus-team-upload-progress">
                    <div className="aboutus-team-upload-bar" style={{ width: `${uploadProgress}%` }} />
                    <span>{uploadProgress === 100 ? 'Done!' : uploadProgress + '%'}</span>
                  </div>
                )}
              </div>
              {newMember.photoURL && uploadProgress === null && (
                <img src={newMember.photoURL} alt="preview" className="aboutus-team-photo-preview" />
              )}
              <div className="aboutus-team-modal-btns">
                <button className="aboutus-team-save-btn" onClick={handleAddMember} disabled={saving}>
                  {saving ? 'Saving…' : 'Add Member'}
                </button>
                <button className="aboutus-team-cancel-btn" onClick={() => setAddingMember(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MEMBER FORM */}
        {isCEO && editingMember && (
          <div className="aboutus-team-modal-overlay" onClick={() => setEditingMember(null)}>
            <div className="aboutus-team-modal" onClick={e => e.stopPropagation()}>
              <h3 className="aboutus-team-modal-title">Edit Team Member</h3>
              <input
                className="aboutus-team-input"
                placeholder="Name *"
                value={editingMember.name}
                onChange={e => setEditingMember(p => ({ ...p, name: e.target.value }))}
              />
              <input
                className="aboutus-team-input"
                placeholder="Role"
                value={editingMember.role}
                onChange={e => setEditingMember(p => ({ ...p, role: e.target.value }))}
              />
              <textarea
                className="aboutus-team-input aboutus-team-textarea"
                placeholder="Short description"
                value={editingMember.description}
                onChange={e => setEditingMember(p => ({ ...p, description: e.target.value }))}
              />
              <div className="aboutus-team-upload-row">
                <label className="aboutus-team-upload-btn">
                  {editingMember.photoURL ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handlePhotoUpload(e.target.files[0], url => setEditingMember(p => ({ ...p, photoURL: url })))}
                  />
                </label>
                {uploadProgress !== null && (
                  <div className="aboutus-team-upload-progress">
                    <div className="aboutus-team-upload-bar" style={{ width: `${uploadProgress}%` }} />
                    <span>{uploadProgress === 100 ? 'Done!' : uploadProgress + '%'}</span>
                  </div>
                )}
              </div>
              {editingMember.photoURL && uploadProgress === null && (
                <img src={editingMember.photoURL} alt="preview" className="aboutus-team-photo-preview" />
              )}
              <div className="aboutus-team-modal-btns">
                <button className="aboutus-team-save-btn" onClick={handleUpdateMember} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="aboutus-team-cancel-btn" onClick={() => setEditingMember(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* TEAM CARDS */}
        {loadingTeam ? (
          <div className="aboutus-team-loading">Loading team…</div>
        ) : teamMembers.length === 0 ? (
          <div className="aboutus-team-empty">
            {isCEO ? 'No team members yet. Click "+ Add Member" to get started.' : 'Meet the team coming soon!'}
          </div>
        ) : (
          <div className="aboutus-team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="aboutus-team-card">
                {/* Polaroid frame */}
                <div className="aboutus-polaroid">
                  <div className="aboutus-polaroid-photo">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.name}
                        className="aboutus-polaroid-img"
                      />
                    ) : (
                      <div className="aboutus-polaroid-placeholder">
                        <span>{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="aboutus-polaroid-bottom">
                    <span className="aboutus-polaroid-name">{member.name}</span>
                    {member.role && <span className="aboutus-polaroid-role">{member.role}</span>}
                  </div>
                </div>
                {member.description && (
                  <p className="aboutus-team-description">{member.description}</p>
                )}
                {isCEO && (
                  <div className="aboutus-team-card-actions">
                    <button
                      className="aboutus-team-edit-btn"
                      onClick={() => { setEditingMember({ ...member }); setAddingMember(false) }}
                    >
                      Edit
                    </button>
                    <button
                      className="aboutus-team-delete-btn"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ABOUTUS