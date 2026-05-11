import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import {
  collection, addDoc, getDocs, updateDoc,
  doc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'

import './articles.css'
import './homepage.css'

const GRACE_ARTICLE = {
  id: 'grace',
  title: 'War in the Gulf: Iran Clashes with U.S. and Israel as Conflict Spreads',
  author_name: 'Grace Ramsey',
  image_source: '',
  image: '/iran-article.png',
  article_body: 'A major armed conflict across the Middle East has entered its third week, centered on military strikes between Iran and a coalition led by the United States and Israel. What began with surprise attacks in late February has evolved into one of the most dangerous confrontations in the region in decades, drawing in multiple countries and threatening global stability.\n\nThe hostilities began on February 28, 2026, when the U.S. and Israel launched coordinated air strikes against the Iranian military and government targets inside Iran. These strikes marked a significant escalation after years of rising tensions over Iran\'s nuclear program, support for armed groups, and prior exchanges of attacks.\n\nIn response, Iran launched waves of missiles and drone strikes against Israeli cities, U.S. military bases and allied states across the Gulf, including Bahrain, Kuwait, Qatar, Saudi Arabia, and the United Arab Emirates.\n\nMultiple Fronts and Regional Impact\n\nIran\'s attacks have damaged civilian infrastructure and public spaces in Gulf states. A drone strike near Dubai International Airport forced temporary flight suspensions and raised concerns about the safety of international travel.\n\nFighting also intensified between Israel and Hezbollah in Lebanon, with airstrikes and ground exchanges adding to the human toll in that country.\n\nIranian threats and actions have disrupted traffic through the Strait of Hormuz, a key artery for global energy transport, pushing oil prices upward.\n\nHuman Cost and Displacement\n\nAccording to multiple reports, thousands of military personnel and civilians have died or been injured. In Lebanon, more than a million people have been displaced.\n\nHumanitarian organizations have expressed alarm at the impact on civilian populations, including reports of damage to homes, hospitals, and schools.\n\nPolitical and Diplomatic Efforts\n\nGlobal reaction has been mixed. Some countries have condemned the violence and called for de-escalation. The Council on Foreign Relations notes that while direct negotiation channels have existed, the rapid escalation has outpaced diplomatic efforts.\n\nEconomic and Global Effects\n\nEnergy prices have risen as disruption to shipping and oil infrastructure spread. The Bank of International Settlements warned that a prolonged conflict could have broader consequences for global financial stability.\n\nFor now, the Middle East remains in a state of heightened insecurity, with the human cost continuing to grow and the diplomatic path toward peace deeply fraught.'
}

const Articles = (props) => {
  const { user, userRole, isCEO, isEditor, isLoggedIn, signInWithGoogle } = useAuth()
  const history = useHistory()
  const location = useLocation()
  const [articles, setArticles] = useState([])
  const [pendingArticles, setPendingArticles] = useState([])
  const [editors, setEditors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', article_body: '', author_name: '', image_source: '', topic: '' })
  const [activeTopic, setActiveTopic] = useState(null)
  const [status, setStatus] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // Open specific article if navigated from homepage
  useEffect(() => {
    if (location.state && location.state.openArticle) {
      const incoming = location.state.openArticle
      if (incoming.id === 'grace' || (incoming.title && incoming.title.includes('Iran'))) {
        setSelectedArticle(GRACE_ARTICLE)
      } else {
        setSelectedArticle(incoming)
      }
      history.replace('/articles', {})
    }
  }, [location.state])

  useEffect(() => {
    const loadArticles = async () => {
      const q = query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'))
      const snap = await getDocs(q)
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadArticles()
  }, [])

  useEffect(() => {
    if (!isEditor) return
    const loadPending = async () => {
      const q = query(collection(db, 'articles'), where('status', 'in', ['pending', 'assigned', 'edited']))
      const snap = await getDocs(q)
      setPendingArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadPending()
  }, [isEditor])

  useEffect(() => {
    if (!isCEO) return
    const loadEditors = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'editor'))
      const snap = await getDocs(q)
      setEditors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadEditors()
  }, [isCEO])

  const [articleImage, setArticleImage] = useState(null) // base64
  const [imageUploadProgress, setImageUploadProgress] = useState(null)

  const handleImageUpload = (file) => {
    if (!file) return
    if (file.size > 800 * 1024) {
      alert('Please use an image under 800KB. Tip: compress it at tinypng.com first.')
      return
    }
    setImageUploadProgress(0)
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable) setImageUploadProgress(Math.round((e.loaded / e.total) * 100))
    }
    reader.onload = () => {
      setArticleImage(reader.result)
      setImageUploadProgress(null)
    }
    reader.onerror = () => { alert('Failed to read image.'); setImageUploadProgress(null) }
    reader.readAsDataURL(file)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) return
    setStatus('sending')
    try {
      await addDoc(collection(db, 'articles'), {
        ...formData,
        image: articleImage || null,
        authorEmail: user.email,
        authorPhoto: user.photoURL,
        authorUid: user.uid,
        status: 'pending',
        submittedAt: serverTimestamp(),
        publishedAt: null,
        assignedTo: null,
      })
      setStatus('success')
      setFormData({ title: '', article_body: '', author_name: '', image_source: '', topic: '' })
      setArticleImage(null)
    } catch (err) {
      setStatus('error')
    }
  }

  const handleAssign = async (articleId, editorId, editorName) => {
    await updateDoc(doc(db, 'articles', articleId), {
      status: 'assigned',
      assignedTo: editorId,
      assignedToName: editorName,
    })
    setPendingArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: 'assigned', assignedToName: editorName } : a))
  }

  const handleMarkEdited = async (articleId) => {
    await updateDoc(doc(db, 'articles', articleId), { status: 'edited' })
    setPendingArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: 'edited' } : a))
  }

  const handleApprove = async (articleId) => {
    await updateDoc(doc(db, 'articles', articleId), { status: 'published', publishedAt: serverTimestamp() })
    setPendingArticles(prev => prev.filter(a => a.id !== articleId))
    window.location.reload()
  }

  const handleReject = async (articleId) => {
    await updateDoc(doc(db, 'articles', articleId), { status: 'rejected' })
    setPendingArticles(prev => prev.filter(a => a.id !== articleId))
  }

  return (
    <div className="articles-container1">
      <Helmet>
        <title>Articles - PoliPatch</title>
        <meta property="og:title" content="Articles - PoliPatch" />
      </Helmet>

      {/* STICKY NAVBAR */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link">Home</Link>
          <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
          <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
          <Link to="/articles" className="homepage-nav-link homepage-nav-link-active">Articles</Link>
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

      {/* FULL PAGE ARTICLE VIEW */}
      {selectedArticle && (
        <div className="articles-full-view">
          <button className="articles-back-btn" onClick={() => setSelectedArticle(null)}>← Back to Articles</button>
          {selectedArticle.title === 'War in the Gulf: Iran Clashes with U.S. and Israel as Conflict Spreads' && (
            <img src="/iran-article.png" alt="Iran Gulf War" className="articles-full-hero-img" />
          )}
          {selectedArticle.image && selectedArticle.title !== 'War in the Gulf: Iran Clashes with U.S. and Israel as Conflict Spreads' && (
            <img src={selectedArticle.image} alt={selectedArticle.title} className="articles-full-hero-img" />
          )}
          <h1 className="articles-full-title">{selectedArticle.title}</h1>
          <p className="articles-full-meta">By {selectedArticle.author_name} {selectedArticle.image_source && ('| Image: ' + selectedArticle.image_source)}</p>
          <div className="articles-full-body">{selectedArticle.article_body}</div>
        </div>
      )}

      {!selectedArticle && (
        <div className="articles-scale-shell">
          <div className="articles-scale-wrap">
            <div className="articles-thq-articles-elm">
              <img src="/screenshot20251205at12541pm32091-k92w-400h.png" alt="background" className="articles-thq-screenshot20251205at12541pm3-elm" />
              <span className="articles-thq-text-elm16"><span className="articles-thq-text-elm17">Poli</span><span>Patch</span></span>
              <span className="articles-thq-text-elm19">ARTICLES</span>
              <span className="articles-thq-text-elm44">Trending</span>

              {/* PUBLISHED ARTICLES GRID */}
              <div className="articles-published-grid">
                {(!activeTopic || activeTopic === 'Current Events') && (
                <div className="articles-card articles-card-feature" onClick={() => setSelectedArticle(GRACE_ARTICLE)}>
                  <img src="/iran-article.png" alt="Iran Gulf War" className="articles-card-img" />
                  <div className="articles-card-title">War in the Gulf: Iran Clashes with U.S. and Israel</div>
                  <div className="articles-card-author">By Grace Ramsey</div>
                  <div className="articles-card-readmore">read more →</div>
                </div>
                )}
                {articles.filter(a => !activeTopic || a.topic === activeTopic).map(article => (
                  <div key={article.id} className="articles-card" onClick={() => setSelectedArticle(article)}>
                    {article.image
                      ? <img src={article.image} alt={article.title} className="articles-card-img" />
                      : <div className="articles-card-img-placeholder">📰</div>
                    }
                    <div className="articles-card-title">{article.title}</div>
                    <div className="articles-card-author">By {article.author_name}</div>
                    <div className="articles-card-readmore">read more →</div>
                  </div>
                ))}
              </div>

              {/* WRITE YOUR OWN ARTICLE */}
              <span className="articles-thq-text-elm45">Write your own article</span>
              <img src="/screenshot20251205at12541pm22100-ktms-1300h.png" alt="" className="articles-thq-screenshot20251205at12541pm2-elm" />

              <div className="articles-submission-form">
                {!isLoggedIn && (
                  <div className="articles-signin-notice">
                    <button onClick={signInWithGoogle} className="articles-google-btn">
                      <img src="https://www.google.com/favicon.ico" alt="Google" width="20" />
                      Sign in with Google to submit
                    </button>
                  </div>
                )}
                {isLoggedIn && <p className="articles-logged-in-as">Signed in as <strong>{user.displayName}</strong></p>}
                <input className="articles-form-input" type="text" name="author_name" placeholder="Your Name" value={formData.author_name} onChange={handleChange} disabled={!isLoggedIn} />
                <input className="articles-form-input" type="text" name="title" placeholder="Article Title" value={formData.title} onChange={handleChange} disabled={!isLoggedIn} />
                <textarea className="articles-form-textarea" name="article_body" placeholder="Write your article here..." value={formData.article_body} onChange={handleChange} disabled={!isLoggedIn} />
                <div className="articles-form-upload">
                  <label className="articles-form-upload-label" style={{opacity: isLoggedIn ? 1 : 0.5, cursor: isLoggedIn ? 'pointer' : 'not-allowed'}}>
                    📷 {articleImage ? 'Change Photo' : 'Upload Article Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={!isLoggedIn}
                      onChange={e => handleImageUpload(e.target.files[0])}
                    />
                  </label>
                  {imageUploadProgress !== null && (
                    <span className="articles-form-filename">{imageUploadProgress === 100 ? 'Done!' : imageUploadProgress + '%'}</span>
                  )}
                  {articleImage && imageUploadProgress === null && (
                    <span className="articles-form-filename">✅ Photo ready</span>
                  )}
                </div>
                {articleImage && (
                  <img src={articleImage} alt="preview" style={{width:'200px', height:'120px', objectFit:'cover', borderRadius:'6px', marginBottom:'8px'}} />
                )}
                <input className="articles-form-input" type="text" name="image_source" placeholder="Image Source (optional)" value={formData.image_source} onChange={handleChange} disabled={!isLoggedIn} />
                <select className="articles-form-input" name="topic" value={formData.topic} onChange={handleChange} disabled={!isLoggedIn}>
                  <option value="">Select a topic (optional)</option>
                  <option value="Elections">Elections</option>
                  <option value="Technology">Technology</option>
                  <option value="LGBTQ+ Rights">LGBTQ+ Rights</option>
                  <option value="Immigration">Immigration</option>
                  <option value="Womens Rights">Womens Rights</option>
                  <option value="Media">Media</option>
                  <option value="Other">Other</option>
                </select>
                <button className="articles-form-submit" disabled={!isLoggedIn || status === 'sending'} onClick={isLoggedIn ? handleSubmit : signInWithGoogle}>
                  {!isLoggedIn ? 'Sign in to Submit' : status === 'sending' ? 'Submitting...' : 'Submit Article'}
                </button>
                {status === 'success' && <p className="articles-form-success">✅ Submitted! Your article will now be sent to an editor.</p>}
                {status === 'error' && <p className="articles-form-error">❌ Something went wrong. Please try again.</p>}
              </div>

              {/* CEO/EDITOR PANEL */}
              {isEditor && pendingArticles.length > 0 && (
                <div className="articles-editor-panel">
                  <h2 className="articles-editor-title">{isCEO ? '👑 CEO Review Panel' : '✏️ Editor Panel'}</h2>
                  {pendingArticles
                    .filter(a => isCEO || a.assignedTo === user.uid)
                    .map(article => (
                    <div key={article.id} className="articles-editor-card">
                      <h3>{article.title}</h3>
                      <p><strong>By:</strong> {article.author_name} · <strong>Status:</strong> {article.status}</p>
                      {article.assignedToName && <p><strong>Assigned to:</strong> {article.assignedToName}</p>}
                      <p className="articles-editor-preview">{article.article_body?.substring(0, 200)}...</p>
                      <div className="articles-editor-btns">
                        {isCEO && article.status === 'pending' && editors.length > 0 && (
                          <select className="articles-editor-select" onChange={(e) => {
                            const [id, name] = e.target.value.split('|')
                            if (id) handleAssign(article.id, id, name)
                          }} defaultValue="">
                            <option value="">Assign to editor...</option>
                            {editors.map(ed => (
                              <option key={ed.id} value={`${ed.id}|${ed.displayName}`}>{ed.displayName}</option>
                            ))}
                          </select>
                        )}
                        {isEditor && !isCEO && article.status === 'assigned' && article.assignedTo === user.uid && (
                          <button className="articles-editor-btn-edit" onClick={() => handleMarkEdited(article.id)}>Mark as Edited ✓</button>
                        )}
                        {isCEO && article.status === 'edited' && (
                          <button className="articles-editor-btn-approve" onClick={() => handleApprove(article.id)}>Approve & Publish ✓</button>
                        )}
                        {isCEO && (
                          <button className="articles-editor-btn-reject" onClick={() => handleReject(article.id)}>Reject ✗</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* APPLY TO BE EDITOR */}
              <span className="articles-thq-text-elm43">Apply to be an Editor</span>
              <span className="articles-thq-text-elm59">
                Interested in helping shape the content on PoliPatch? Apply to become an editor and help review and refine articles submitted by the community.
              </span>
              <div className="articles-thq-frame10-elm">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfuuaCMNg97SzXs_k4dkyE-omf8jWw0x7CsjsVOSclM9lM_BA/viewform" target="_blank" rel="noopener noreferrer" className="articles-thq-text-elm60">Apply here</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Articles