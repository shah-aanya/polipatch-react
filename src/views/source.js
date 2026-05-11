import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

import './source.css'
import './homepage.css'

const SOURCES = [
  {
    name: 'League of Women Voters',
    description: 'The League of Women Voters is a neutral organization because it does not support political parties or candidates and instead focuses on promoting informed voting, civic participation, and democratic processes.',
    links: [
      { label: 'journalreview.com', url: 'https://www.journalreview.com/stories/is-the-lwv-left-leaning-or-liberal,280575' },
    ]
  },
  {
    name: 'FactCheck.org',
    description: 'FactCheck.org is a neutral publication because it is a nonpartisan project of the Annenberg Public Policy Center at the University of Pennsylvania that evaluates the factual accuracy of statements made by political figures from all parties.',
    links: [
      { label: 'lwv.org', url: 'https://my.lwv.org/new-york/utica-rome-metropolitan-area/voting-elections/non-partisan-websites' },
      { label: 'fresnostate.edu', url: 'https://guides.library.fresnostate.edu/c.php?g=289237&p=7083392' },
    ]
  },
  {
    name: 'Ballotpedia.org',
    description: 'Ballotpedia is a neutral publication because it provides nonpartisan, fact-based information about elections, candidates, and public policy without endorsing political parties or positions.',
    links: [
      { label: 'mediabiasfactcheck.com', url: 'https://mediabiasfactcheck.com/ballotpedia/' },
      { label: 'allsides.com', url: 'https://www.allsides.com/news-source/ballotpedia-media-bias' },
    ]
  },
  {
    name: 'AllSides',
    description: '"All Sides" is considered unbiased because it presents perspectives from the left, center, and right on the same issue, allowing readers to compare viewpoints side by side. Instead of promoting one opinion, it aims to show balanced coverage so people can form their own conclusions.',
    links: [
      { label: 'stonybrook.edu', url: 'https://guides.library.stonybrook.edu/news/bias' },
    ]
  },
  {
    name: 'The Hill',
    description: 'The Hill is often viewed as relatively unbiased because it focuses on political reporting that presents perspectives from both major U.S. parties and emphasizes direct quotes, policy coverage, and legislative developments.',
    links: [
      { label: 'adfontesmedia.com', url: 'https://adfontesmedia.com/hill-bias-and-reliability/' },
      { label: 'mediabiasfactcheck.com', url: 'https://mediabiasfactcheck.com/the-hill/' },
    ]
  },
  {
    name: 'Associated Press',
    description: 'The Associated Press (AP) is widely considered unbiased because it is a nonprofit, member-owned news cooperative that serves thousands of different news outlets rather than a single political or corporate owner.',
    links: [
      { label: 'reportforamerica.org', url: 'https://www.reportforamerica.org/newsrooms/the-associated-press-14/' },
      { label: 'ebsco.com', url: 'https://www.ebsco.com/research-starters/communication-and-mass-media/associated-press-ap-and-censorship' },
    ]
  },
  {
    name: 'Reuters',
    description: 'Reuters is widely regarded as unbiased because it operates as a global news agency committed to strict editorial guidelines emphasizing accuracy, neutrality, and fact-based reporting.',
    links: [
      { label: 'adfontesmedia.com', url: 'https://adfontesmedia.com/reuters-bias-and-reliability/' },
      { label: 'mutualfundobserver.com', url: 'https://mutualfundobserver.com/discuss/discussion/50533/how-reliable-is-reuters-news-service' },
    ]
  },
  {
    name: 'Politico',
    description: 'Politico is often considered relatively balanced because it focuses on detailed, insider political reporting and policy coverage rather than overt ideological advocacy.',
    links: [
      { label: 'mediabiasfactcheck.com', url: 'https://mediabiasfactcheck.com/politico/' },
      { label: 'adfontesmedia.com', url: 'https://adfontesmedia.com/politicos-pulse-check-bias-and-reliability/' },
    ]
  },
  {
    name: 'NewsNation',
    description: 'NewsNation positions itself as an unbiased news outlet by emphasizing fact-based reporting and presenting multiple perspectives on controversial issues.',
    links: [
      { label: 'adfontesmedia.com', url: 'https://adfontesmedia.com/newsnation-now-bias-reliability/' },
      { label: 'allsides.com', url: 'https://www.allsides.com/news-source/newsnation-media-bias' },
    ]
  },
  {
    name: 'PBS News',
    description: 'Public Broadcasting Service (PBS) is widely regarded as unbiased because it is a nonprofit, publicly funded broadcaster with strict editorial standards that prioritize fact-based reporting over commercial or partisan interests.',
    links: [
      { label: 'adfontesmedia.com', url: 'https://adfontesmedia.com/pbs-bias-and-reliability/' },
      { label: 'wikipedia.org', url: 'https://en.wikipedia.org/wiki/PBS' },
    ]
  },
]

const BASICS = [
  { num: '1.', title: 'Create Your Profile', body: 'Start by setting up your profile. You can add a profile picture, customize your background, write a short biography, and optionally display ideology or belief icons. Your profile shows your activity and the contributions you make to the community.' },
  { num: '2.', title: 'Explore Articles', body: 'Browse articles written by other teens about current political issues. If you find one you like, you can favorite or "star" it so you can easily come back to it later.' },
  { num: '3.', title: 'Join Debates', body: 'Head to the debate section to participate in moderated discussions. You can respond to prompts, share your perspective, and engage with others respectfully. Debates follow clear guidelines to keep conversations thoughtful and productive.' },
  { num: '4.', title: 'Write and Publish Articles', body: 'If you have an idea or opinion, you can write your own article and publish it on PoliPatch. You can either publish it yourself or use the "Request an Editor" option if you want someone to review and polish your article first.' },
  { num: '5.', title: 'Start or Contribute to Discussions', body: 'Users can join ongoing debates or create new debate threads on topics they care about. This helps spark conversations and bring different viewpoints together.' },
  { num: '6.', title: 'Contribute to the Resource Section', body: 'You can help other users learn by adding helpful resources, guides, or neutral publications to the resource page.' },
  { num: '7.', title: 'Earn Badges and Patches', body: 'As you participate—writing articles, joining debates, or contributing resources—you earn badges and topic patches that show how you engage with the community and what issues you care about.' },
  { num: '8.', title: 'Track Your Impact', body: 'Your profile automatically tracks your contributions, including articles published, debates joined, and resources added. These activities may also count toward volunteer hours depending on your school\'s requirements.' },
  { num: '9.', title: 'Stay Respectful and Engage in Good Faith', body: 'PoliPatch is built on respectful conversation. Always follow debate guidelines, support claims with evidence, and listen to other perspectives.' },
]

const DEFAULT_SOURCE_CONTENT = {
  heroDesc: 'We hand-selected non-biased and reliable sources that can be used as educational and research materials.',
  basicsIntro: "New to PoliPatch? Here's a quick guide to help you get started and make the most of the platform!",
  basics1Title: 'Create Your Profile',
  basics1Body: 'Start by setting up your profile. You can add a profile picture, customize your background, write a short biography, and optionally display ideology or belief icons. Your profile shows your activity and the contributions you make to the community.',
  basics2Title: 'Explore Articles',
  basics2Body: 'Browse articles written by other teens about current political issues. If you find one you like, you can favorite or "star" it so you can easily come back to it later.',
  basics3Title: 'Join Debates',
  basics3Body: 'Head to the debate section to participate in moderated discussions. You can respond to prompts, share your perspective, and engage with others respectfully. Debates follow clear guidelines to keep conversations thoughtful and productive.',
  basics4Title: 'Write and Publish Articles',
  basics4Body: 'If you have an idea or opinion, you can write your own article and publish it on PoliPatch. You can either publish it yourself or use the "Request an Editor" option if you want someone to review and polish your article first.',
  basics5Title: 'Start or Contribute to Discussions',
  basics5Body: 'Users can join ongoing debates or create new debate threads on topics they care about. This helps spark conversations and bring different viewpoints together.',
  basics6Title: 'Contribute to the Resource Section',
  basics6Body: 'You can help other users learn by adding helpful resources, guides, or neutral publications to the resource page.',
  basics7Title: 'Earn Badges and Patches',
  basics7Body: 'As you participate—writing articles, joining debates, or contributing resources—you earn badges and topic patches that show how you engage with the community and what issues you care about.',
  basics8Title: 'Track Your Impact',
  basics8Body: "Your profile automatically tracks your contributions, including articles published, debates joined, and resources added. These activities may also count toward volunteer hours depending on your school's requirements.",
  basics9Title: 'Stay Respectful and Engage in Good Faith',
  basics9Body: 'PoliPatch is built on respectful conversation. Always follow debate guidelines, support claims with evidence, and listen to other perspectives.',
  sources: null, // null means use the hardcoded SOURCES array
}

const Source = (props) => {
  const { user, userRole, isCEO, isLoggedIn, signInWithGoogle } = useAuth()
  const history = useHistory()

  const [pageContent, setPageContent] = useState(DEFAULT_SOURCE_CONTENT)
  const [editingContent, setEditingContent] = useState(false)
  const [contentDraft, setContentDraft] = useState(DEFAULT_SOURCE_CONTENT)
  const [saving, setSaving] = useState(false)
  const [sourceDraft, setSourceDraft] = useState(null) // array of {name, description, links:[{label,url}]}

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'sources'))
        if (snap.exists()) {
          const merged = { ...DEFAULT_SOURCE_CONTENT, ...snap.data() }
          setPageContent(merged)
          setContentDraft(merged)
          if (merged.sources) setSourceDraft(merged.sources)
          else setSourceDraft(SOURCES.map(s => ({ ...s, links: s.links.map(l => ({ ...l })) })))
        } else {
          setSourceDraft(SOURCES.map(s => ({ ...s, links: s.links.map(l => ({ ...l })) })))
        }
      } catch (e) {
        console.error(e)
        setSourceDraft(SOURCES.map(s => ({ ...s, links: s.links.map(l => ({ ...l })) })))
      }
    }
    load()
  }, [])

  const handleSaveContent = async () => {
    setSaving(true)
    try {
      const saveData = { ...contentDraft, sources: sourceDraft }
      await setDoc(doc(db, 'siteContent', 'sources'), saveData)
      setPageContent({ ...contentDraft, sources: sourceDraft })
      setEditingContent(false)
      alert('Saved successfully!')
    } catch (e) {
      alert('Error saving: ' + e.message)
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <div className="source-container1">
      <Helmet>
        <title>Sources - PoliPatch</title>
        <meta property="og:title" content="Sources - PoliPatch" />
      </Helmet>

      {/* NAVBAR */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link">Home</Link>
          <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
          <Link to="/volunteer" className="homepage-nav-link">Volunteer</Link>
          <Link to="/articles" className="homepage-nav-link">Articles</Link>
          <Link to="/debates" className="homepage-nav-link">Debates</Link>
          <Link to="/source" className="homepage-nav-link homepage-nav-link-active">Sources</Link>
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

      <div className="source-main">

        {/* HERO */}
        <div className="source-hero">
          <img src="/screenshot20251205at12541pm22035-6ei-1500w.png" alt="" className="source-hero-bg" />
          <div className="source-hero-subtitle">PoliPatch</div>
          <h1 className="source-hero-title">Sources</h1>
          <p className="source-hero-desc">{pageContent.heroDesc}</p>
        </div>

        {/* LEARN THE BASICS */}
        <div className="source-section source-basics-section">
          <h2 className="source-section-title">Learn the Basics</h2>
          <p className="source-basics-intro">{pageContent.basicsIntro}</p>
          <div className="source-basics-list">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <div key={n} className="source-basics-row">
                <div className="source-basics-num">{n}.</div>
                <div className="source-basics-content">
                  <div className="source-basics-title">{pageContent[`basics${n}Title`]}</div>
                  <div className="source-basics-body">{pageContent[`basics${n}Body`]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED SOURCES */}
        <div className="source-section">
          <h2 className="source-section-title">Recommended Sources</h2>
          <div className="source-list">
            {(pageContent.sources || SOURCES).map((s, i) => (
              <div key={i} className="source-row">
                <div className="source-row-left">
                  <div className="source-name">{s.name}</div>
                </div>
                <div className="source-row-right">
                  <p className="source-desc">{s.description}</p>
                  <div className="source-links">
                    {s.links.map((l, j) => (
                      <a key={j} href={l.url} target="_blank" rel="noopener noreferrer" className="source-link">
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CEO CONTENT EDITOR */}
      {isCEO && (
        <div className="source-edit-bar">
          {!editingContent ? (
            <button className="source-edit-btn" onClick={() => { setContentDraft({...pageContent}); if (!sourceDraft) setSourceDraft(SOURCES.map(s => ({ ...s, links: s.links.map(l => ({ ...l })) }))); setEditingContent(true) }}>
              Edit Page Content
            </button>
          ) : (
            <div className="source-edit-modal">
              <h3 className="source-edit-title">Edit Page Content</h3>
              <div className="source-edit-scroll">
                <label className="source-edit-label">Hero Description</label>
                <textarea className="source-edit-textarea" value={contentDraft.heroDesc} onChange={e => setContentDraft(p => ({...p, heroDesc: e.target.value}))} />

                <label className="source-edit-label">Learn the Basics — Intro</label>
                <textarea className="source-edit-textarea" value={contentDraft.basicsIntro} onChange={e => setContentDraft(p => ({...p, basicsIntro: e.target.value}))} />

                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <div key={n}>
                    <label className="source-edit-label">Step {n} — Title</label>
                    <input className="source-edit-input" value={contentDraft[`basics${n}Title`]} onChange={e => setContentDraft(p => ({...p, [`basics${n}Title`]: e.target.value}))} />
                    <label className="source-edit-label">Step {n} — Body</label>
                    <textarea className="source-edit-textarea" value={contentDraft[`basics${n}Body`]} onChange={e => setContentDraft(p => ({...p, [`basics${n}Body`]: e.target.value}))} />
                  </div>
                ))}

                <div style={{borderTop:'1px solid #eee', paddingTop:'12px', marginTop:'8px'}}>
                  <label className="source-edit-label" style={{fontSize:'14px', marginBottom:'8px', display:'block'}}>Recommended Sources</label>
                  {sourceDraft && sourceDraft.map((s, i) => (
                    <div key={i} style={{marginBottom:'16px', padding:'12px', background:'#f9f9f9', borderRadius:'8px'}}>
                      <label className="source-edit-label">Source {i+1} — Name</label>
                      <input className="source-edit-input" value={s.name} onChange={e => setSourceDraft(prev => prev.map((src, idx) => idx === i ? {...src, name: e.target.value} : src))} />
                      <label className="source-edit-label">Source {i+1} — Description</label>
                      <textarea className="source-edit-textarea" value={s.description} onChange={e => setSourceDraft(prev => prev.map((src, idx) => idx === i ? {...src, description: e.target.value} : src))} />
                      <label className="source-edit-label">Source {i+1} — Links (one per line, format: label|url)</label>
                      <textarea className="source-edit-textarea" value={s.links.map(l => l.label + '|' + l.url).join('\n')} onChange={e => {
                        const lines = e.target.value.split('\n').filter(l => l.trim())
                        const links = lines.map(line => { const [label, ...rest] = line.split('|'); return { label: label?.trim() || '', url: rest.join('|').trim() } })
                        setSourceDraft(prev => prev.map((src, idx) => idx === i ? {...src, links} : src))
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="source-edit-btns">
                <button className="source-save-btn" onClick={handleSaveContent} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button className="source-cancel-btn" onClick={() => setEditingContent(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Source