import React, { useState, useEffect } from 'react'

import { Helmet } from 'react-helmet'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

import './volunteer.css'

const Volunteer = (props) => {
  const { user, isLoggedIn, userRole, signInWithGoogle } = useAuth()
  const history = useHistory()
  const [volunteerHours, setVolunteerHours] = useState(0)

  useEffect(() => {
    if (!user) return
    const loadHours = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        setVolunteerHours(snap.data().volunteerHours || 0)
      }
    }
    loadHours()
  }, [user])

  const fullStars = Math.floor(volunteerHours / 5)
  const hasHalfStar = (volunteerHours % 5) >= 2.5

  return (
    <div className="volunteer-container1">
      <Helmet>
        <title>Volunteer - exported project</title>
        <meta property="og:title" content="Volunteer - exported project" />
        <link
          rel="canonical"
          href="https://polipatch-copy-ycxznx.teleporthq.app/volunteer"
        />
        <meta
          property="og:url"
          content="https://polipatch-copy-ycxznx.teleporthq.app/volunteer"
        />
      </Helmet>

      {/* STICKY NAVBAR - same as homepage */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link">Home</Link>
          <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
          <Link to="/volunteer" className="homepage-nav-link homepage-nav-link-active">Volunteer</Link>
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

      {/* SCALE WRAPPER - same as homepage */}
      <div className="volunteer-scale-shell">
        <div className="volunteer-scale-wrap">
          <div className="volunteer-thq-volunteer-elm">
            <span className="volunteer-thq-text-elm16">PoliPatch</span>
            <span className="volunteer-thq-text-elm17">volunteer with us today!!</span>
            <span className="volunteer-thq-text-elm18">get one star for every five hours you volunteer</span>
            <span className="volunteer-thq-text-elm19">Volunteer</span>
            <span className="volunteer-thq-text-elm20">Track your progress!</span>
            <div className="volunteer-thq-frame7-elm">
              <span className="volunteer-thq-text-elm21">01</span>
              <span className="volunteer-thq-text-elm22">02</span>
            </div>
            <img src="/rectangle52091-wdo8.svg" alt="Rectangle52091" className="volunteer-thq-rectangle5-elm" />
            {/* Decorative stars near title - always visible */}
            <img src="/star42091-z8a9.svg" alt="Star" className="volunteer-thq-star4-elm" />
            <img src="/star52091-ptcc.svg" alt="Star" className="volunteer-thq-star5-elm" />
            <span className="volunteer-thq-text-elm24">Total hours:</span>
            <span className="volunteer-thq-text-elm25">{isLoggedIn ? volunteerHours : '—'}</span>
            {/* Dynamic stars - grid layout, 5 per row, smaller after 75hrs */}
            {isLoggedIn && Array.from({ length: Math.min(fullStars, 25) }).map((_, i) => {
              const isSmall = volunteerHours >= 75
              const size = isSmall ? 40 : 80
              const gapH = isSmall ? 45 : 70
              const gapV = isSmall ? 55 : 100
              const perRow = isSmall ? 10 : 5
              return (
                <img key={i} src="/star12091-l3zt.svg" alt="star" className="volunteer-dynamic-star" style={{
                  position: 'absolute',
                  top: `${500 + Math.floor(i / perRow) * gapV}px`,
                  left: `${600 - (i % perRow) * gapH}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                }} />
              )
            })}
            <span className="volunteer-thq-text-elm26">Ways to Volunteer</span>
            <span className="volunteer-thq-text-elm27">QUESTIONS?</span>
            <span className="volunteer-thq-text-elm28">
              Write an article for PoliPatch! This article can be about any
              political topic you are interested in
              <span dangerouslySetInnerHTML={{ __html: ' ' }} />
            </span>
            <span className="volunteer-thq-text-elm29">
              Join a debate discussion and actively participate!
              <span dangerouslySetInnerHTML={{ __html: ' ' }} />
            </span>
            <Link to="/articles" className="volunteer-thq-text-elm30" onClick={() => window.scrollTo(0,0)}>more info</Link>
            <Link to="/debates" className="volunteer-thq-text-elm31" onClick={() => window.scrollTo(0,0)}>more info</Link>
            <span className="volunteer-thq-text-elm34">
              <span className="volunteer-thq-text-elm35">Frequently asked questions:</span>
              <span className="volunteer-thq-text-elm36"> </span>
              <br></br>
              <span className="volunteer-thq-text-elm37">1). What does it mean to volunteer on PoliPatch?</span>
              <span className="volunteer-thq-text-elm38">
                {' '}Volunteering on PoliPatch means contributing your time and skills
                to help the community grow. You can write articles, join debates, or
                add helpful resources—all of which support other teens in learning
                and engaging politically.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm39">2). How can I start volunteering?</span>
              <span className="volunteer-thq-text-elm40">
                {' '}Getting started is easy! Pick one of the volunteer options: write
                an article for publication, join or create a debate thread, or
                contribute to the resource section. Once you participate, your
                contributions are recognized on your profile.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm41">3). What kinds of activities count as volunteering?</span>
              <span className="volunteer-thq-text-elm42">
                {' '}Volunteering activities include writing articles, participating in
                debates, creating debate threads, and adding to the resource
                section. Essentially, any activity that helps the community learn,
                share, or engage politically counts.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm43">4). Can I earn school or community service hours by volunteering?</span>
              <span className="volunteer-thq-text-elm44">
                {' '}Yes! PoliPatch tracks volunteer participation for eligible
                activities. You can use your contributions to earn school volunteer
                hours, depending on your school's requirements.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm45">5). Do I need to have writing or debate experience to volunteer?</span>
              <span className="volunteer-thq-text-elm46">
                {' '}Not at all! PoliPatch is designed for all levels. Editors can help
                refine articles, and debate threads are moderated to ensure
                respectful participation. You just need a willingness to engage and
                learn.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm47">6). How do I submit an article or resource for volunteer credit?</span>
              <span className="volunteer-thq-text-elm48">
                {' '}For articles, either publish your own or use the "Request an
                Editor" option to have an editor review it. For resources, add your
                submission to the resource section following the site's submission
                guidelines. (Similar to the debate guidelines).
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm49">7). Can I create my own debate thread to volunteer?</span>
              <span className="volunteer-thq-text-elm50">
                {' '}Absolutely! Creating a debate thread is a great way to volunteer.
                Make sure your topic follows the community guidelines and encourages
                respectful discussion.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm51">8). How do I track my contributions and hours?</span>
              <span className="volunteer-thq-text-elm52">
                {' '}PoliPatch automatically tracks your activity, including articles
                published, debates joined, and resources added. Your profile will
                display badges and recognition for your volunteer contributions.
              </span>
              <br></br>
              <span className="volunteer-thq-text-elm53">9). Is there a limit to how much I can volunteer?</span>
              <span className="volunteer-thq-text-elm54">
                {' '}Nope! You can volunteer as much as you want. The more you
                contribute, the more impact you make and the more badges and
                recognition you earn.
              </span>
              <br></br>
              <br></br>
              <span className="volunteer-thq-text-elm55">Who can I contact if I have questions about volunteering?</span>
              <br></br>
              <span>
                {' '}If you have questions, you can contact the PoliPatch team through
                the site's "Contact Us" form or reach out to your assigned editor or
                moderator for guidance.
              </span>
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Volunteer