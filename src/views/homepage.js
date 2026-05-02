import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import './homepage.css'

const HOMEPAGE = (props) => {
  return (
    <div className="homepage-container1">
      <Helmet>
        <title>exported project</title>
        <meta property="og:title" content="exported project" />
        <link
          rel="canonical"
          href="https://polipatch-copy-ycxznx.teleporthq.app/"
        />
        <meta
          property="og:url"
          content="https://polipatch-copy-ycxznx.teleporthq.app/"
        />
      </Helmet>

      {/* STICKY NAVBAR */}
      <div className="homepage-nav-sticky">
        <nav className="homepage-nav-inner">
          <Link to="/" className="homepage-nav-link homepage-nav-link-active">
            Home
          </Link>
          <Link to="/aboutus" className="homepage-nav-link">
            About Us
          </Link>
          <Link to="/volunteer" className="homepage-nav-link">
            Volunteer
          </Link>
          <Link to="/articles" className="homepage-nav-link">
            Articles
          </Link>
          <Link to="/debates" className="homepage-nav-link">
            Debates
          </Link>
          <Link to="/source" className="homepage-nav-link">
            Sources
          </Link>
        </nav>
      </div>

      {/* SCALE WRAPPER - keeps your same design, just makes it fit screen */}
      <div className="homepage-scale-shell">
        <div className="homepage-scale-wrap">
          <div className="homepage-thq-homepage-elm">
            <img
              src="/people25906061280122-qr5h-800h.png"
              alt="people25906061280122"
              className="homepage-thq-people259060612801-elm"
            />

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="homepage-thq-text-elm10">PoliPatch</span>
            </Link>

            <span className="homepage-thq-text-elm11">
              WELCOME TO
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>

            <img
              src="/screenshot20251205at12541pm12013-hho-800h.png"
              alt="Screenshot20251205at12541PM12013"
              className="homepage-thq-screenshot20251205at12541pm1-elm"
            />

            <span className="homepage-thq-text-elm12">
              <span>A patchwork of ideas and viewpoints</span>
              <br></br>
              <br></br>
            </span>

            <span className="homepage-thq-text-elm14">
              PoliPatch is an online platform created for politically engaged
              teenagers across the political spectrum. It provides a space for
              young people to share their opinions, publish articles, and
              participate in thoughtful, respectful discussions about current
              political issues.
            </span>

            <div className="homepage-thq-component4-elm">
              <img
                src="/rectangle3i657-nium-400h.png"
                alt="Rectangle3I657"
                className="homepage-thq-rectangle3-elm1"
              />
              <span className="homepage-thq-text-elm15">description</span>
              <div className="homepage-thq-title-elm1">
                <span className="homepage-thq-text-elm16">Title</span>
              </div>
            </div>

            <span className="homepage-thq-text-elm17">UPCOMING EVENTS!</span>

            <img
              src="/rectangle6515-ogxj-400w.png"
              alt="Rectangle6515"
              className="homepage-thq-rectangle-elm"
            />

            <img
              src="/screenshot20251201at122141am16515-vvvn-500w.png"
              alt="Screenshot20251201at122141AM16515"
              className="homepage-thq-screenshot20251201at122141am1-elm"
            />

            <img
              src="/screenshot20251201at122129am16516-itajf-500w.png"
              alt="Screenshot20251201at122129AM16516"
              className="homepage-thq-screenshot20251201at122129am1-elm"
            />

            <span className="homepage-thq-text-elm23">Event 1</span>
            <span className="homepage-thq-text-elm24">Event 2</span>
            <span className="homepage-thq-text-elm25">Event 3</span>
            <span className="homepage-thq-text-elm26">more info</span>
            <span className="homepage-thq-text-elm27">more info</span>
            <span className="homepage-thq-text-elm28">more info</span>
            <span className="homepage-thq-text-elm29">description</span>
            <span className="homepage-thq-text-elm30">description</span>
            <span className="homepage-thq-text-elm31">description</span>

            <div className="homepage-thq-component1-elm">
              <img
                src="/rectangle3i654-8el-400h.png"
                alt="Rectangle3I654"
                className="homepage-thq-rectangle3-elm2"
              />
              <span className="homepage-thq-text-elm32">description</span>
              <div className="homepage-thq-title-elm2">
                <span className="homepage-thq-text-elm33">Title</span>
              </div>
            </div>

            <div className="homepage-thq-component3-elm">
              <img
                src="/rectangle3i656-ca8d-400h.png"
                alt="Rectangle3I656"
                className="homepage-thq-rectangle3-elm3"
              />
              <span className="homepage-thq-text-elm34">description</span>
              <div className="homepage-thq-title-elm3">
                <span className="homepage-thq-text-elm35">Title</span>
              </div>
            </div>

            <div className="homepage-thq-component6-elm">
              <img
                src="/rectangle4i652-oihy-600h.png"
                alt="Rectangle4I652"
                className="homepage-thq-rectangle4-elm"
              />
              <img
                src="/polygon1i652-ks3e.svg"
                alt="Polygon1I652"
                className="homepage-thq-polygon1-elm"
              />
            </div>

            <span className="homepage-thq-text-elm36">
              <span>Email:contact@polipatch.org</span>
              <br></br>
              <span>Phone Number: 12345678</span>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
            </span>

            <span className="homepage-thq-text-elm39">Featured Articles</span>
            <span className="homepage-thq-text-elm40">Contact Us</span>

            <Link
              to="/aboutus"
              className="homepage-learn-more-link"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="homepage-thq-frame1-elm">
                <img
                  src="/rectangle1i2028-4zt3-200h.png"
                  alt="Rectangle1I2028"
                  className="homepage-thq-rectangle1-elm"
                />
                <span className="homepage-thq-text-elm41">Learn More</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HOMEPAGE