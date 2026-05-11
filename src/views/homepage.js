import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

import './homepage.css'

const HOMEPAGE = (props) => {
  const { user, userRole, isLoggedIn, signInWithGoogle } = useAuth()
  const history = useHistory()
  const [featuredArticles, setFeaturedArticles] = useState([])

  // Grace Ramsey hardcoded article
  const graceArticle = {
    id: 'grace',
    title: 'War in the Gulf: Iran Clashes with U.S. and Israel',
    author_name: 'Grace Ramsey',
    image: '/iran-article.png',
    publishedAt: { seconds: 9999999999 }, // always first
  }

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(2)
        )
        const snap = await getDocs(q)
        setFeaturedArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      }
    }
    loadFeatured()
  }, [])

  // Combine: Grace first, then up to 2 newest from Firebase
  const allFeatured = [graceArticle, ...featuredArticles].slice(0, 3)

  return (
    <div className="homepage-container1">
      <Helmet>
        <title>exported project</title>
        <meta property="og:title" content="exported project" />
        <link rel="canonical" href="https://polipatch-copy-ycxznx.teleporthq.app/" />
        <meta property="og:url" content="https://polipatch-copy-ycxznx.teleporthq.app/" />
      </Helmet>

      {/* STICKY NAVBAR */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link homepage-nav-link-active">Home</Link>
          <Link to="/aboutus" className="homepage-nav-link">About Us</Link>
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

      {/* SCALE WRAPPER */}
      <div className="homepage-scale-shell">
        <div className="homepage-scale-wrap">
          <div className="homepage-thq-homepage-elm">
            <img src="/people25906061280122-qr5h-800h.png" alt="people25906061280122" className="homepage-thq-people259060612801-elm" />

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="homepage-thq-text-elm10">PoliPatch</span>
            </Link>

            <span className="homepage-thq-text-elm11">
              WELCOME TO
              <span dangerouslySetInnerHTML={{ __html: ' ' }} />
            </span>

            <img src="/screenshot20251205at12541pm12013-hho-800h.png" alt="Screenshot" className="homepage-thq-screenshot20251205at12541pm1-elm" />

            <span className="homepage-thq-text-elm12">
              <span>A patchwork of ideas and viewpoints</span>
              <br /><br />
            </span>

            <span className="homepage-thq-text-elm14">
              PoliPatch is an online platform created for politically engaged
              teenagers across the political spectrum. It provides a space for
              young people to share their opinions, publish articles, and
              participate in thoughtful, respectful discussions about current
              political issues.
            </span>

            {/* FEATURED ARTICLES - dynamic */}
            <span className="homepage-thq-text-elm39">Featured Articles</span>

            {/* Article 1 - always Grace Ramsey */}
            <div className="homepage-thq-component1-elm" onClick={() => history.push('/articles', { openArticle: allFeatured[0] })} style={{cursor:'pointer'}}>
              <img src={allFeatured[0]?.image || '/rectangle3i654-8el-400h.png'} alt="article" className="homepage-thq-rectangle3-elm2" style={{objectFit:'cover'}} />
              <span className="homepage-thq-text-elm32">{allFeatured[0]?.author_name || 'Author'}</span>
              <div className="homepage-thq-title-elm2">
                <span className="homepage-thq-text-elm33" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{allFeatured[0]?.title?.substring(0, 60) || 'Title'}</span>
              </div>
            </div>

            {/* Article 2 */}
            <div className="homepage-thq-component3-elm" onClick={() => history.push('/articles', { openArticle: allFeatured[1] })} style={{cursor:'pointer'}}>
              <img src={allFeatured[1]?.image || '/rectangle3i656-ca8d-400h.png'} alt="article" className="homepage-thq-rectangle3-elm3" style={{objectFit:'cover'}} />
              <span className="homepage-thq-text-elm34">{allFeatured[1]?.author_name || 'Author'}</span>
              <div className="homepage-thq-title-elm3">
                <span className="homepage-thq-text-elm35" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{allFeatured[1]?.title?.substring(0, 60) || 'Title'}</span>
              </div>
            </div>

            {/* Article 3 */}
            <div className="homepage-thq-component4-elm" onClick={() => history.push('/articles', { openArticle: allFeatured[2] })} style={{cursor:'pointer'}}>
              <img src={allFeatured[2]?.image || '/rectangle3i657-nium-400h.png'} alt="article" className="homepage-thq-rectangle3-elm1" style={{objectFit:'cover'}} />
              <span className="homepage-thq-text-elm15">{allFeatured[2]?.author_name || 'Author'}</span>
              <div className="homepage-thq-title-elm1">
                <span className="homepage-thq-text-elm16" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{allFeatured[2]?.title?.substring(0, 60) || 'Title'}</span>
              </div>
            </div>

            <div className="homepage-thq-component6-elm">
              <img src="/rectangle4i652-oihy-600h.png" alt="Rectangle4I652" className="homepage-thq-rectangle4-elm" />
              <img src="/polygon1i652-ks3e.svg" alt="Polygon1I652" className="homepage-thq-polygon1-elm" />
            </div>

            <span className="homepage-thq-text-elm36">
              <span>Email:contact@polipatch.org</span>
              <br />
              <span>Phone Number: 12345678</span>
              <br /><br /><br /><br /><br />
            </span>

            <span className="homepage-thq-text-elm40">Contact Us</span>

            <Link to="/aboutus" className="homepage-learn-more-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="homepage-thq-frame1-elm" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <img src="/rectangle1i2028-4zt3-200h.png" alt="Rectangle1I2028" className="homepage-thq-rectangle1-elm" />
                <span className="homepage-thq-text-elm41" style={{position:'absolute', width:'100%', textAlign:'center', left:'0', top:'50%', transform:'translateY(-50%)'}}>Learn More</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HOMEPAGE