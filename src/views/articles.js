import React, { useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'

import './articles.css'
import './homepage.css'

const Articles = (props) => {
  const [formData, setFormData] = useState({
    author_name: '',
    title: '',
    article_body: '',
    image_source: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [status, setStatus] = useState(null) // 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')

    const templateParams = {
      author_name: formData.author_name,
      title: formData.title,
      article_body: formData.article_body,
      image_source: formData.image_source,
      image_name: imageFile ? imageFile.name : 'No image uploaded',
    }

    emailjs
      .send('service_vs8w37b', 'template_vxk5th7', templateParams, 'zYt3rvaBTOeu5gv6T')
      .then(() => {
        setStatus('success')
        setFormData({ author_name: '', title: '', article_body: '', image_source: '' })
        setImageFile(null)
      })
      .catch(() => {
        setStatus('error')
      })
  }

  return (
    <div className="articles-container1">
      <Helmet>
        <title>Articles - exported project</title>
        <meta property="og:title" content="Articles - exported project" />
        <link rel="canonical" href="https://polipatch-copy-ycxznx.teleporthq.app/articles" />
        <meta property="og:url" content="https://polipatch-copy-ycxznx.teleporthq.app/articles" />
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
        </nav>
      </div>

      {/* SCALE WRAPPER */}
      <div className="articles-scale-shell">
        <div className="articles-scale-wrap">
          <div className="articles-thq-articles-elm">
            <img
              src="/screenshot20251205at12541pm32091-k92w-400h.png"
              alt="Screenshot20251205at12541PM32091"
              className="articles-thq-screenshot20251205at12541pm3-elm"
            />
            <span className="articles-thq-text-elm16">
              <span className="articles-thq-text-elm17">Poli</span>
              <span>Patch</span>
            </span>
            <span className="articles-thq-text-elm19">ARTICLES</span>
            <img src="/rectangle2097-2djc-300w.png" alt="Rectangle2097" className="articles-thq-rectangle-elm1" />
            <img src="/screenshot20251201at122141am12097-ihxm-300w.png" alt="Screenshot20251201at122141AM12097" className="articles-thq-screenshot20251201at122141am1-elm" />
            <img src="/tempimagelqgknm22097-adb5-500h.png" alt="tempImagelqgKnm22097" className="articles-thq-temp-imagelqg-knm2-elm" />
            <span className="articles-thq-text-elm20">Title</span>
            <span className="articles-thq-text-elm21">Title</span>
            <span className="articles-thq-text-elm22">read more</span>
            <span className="articles-thq-text-elm23">read more</span>
            <img src="/rectangle2100-74jb-400w.png" alt="Rectangle2100" className="articles-thq-rectangle-elm2" />
            <img src="/screenshot20251201at122141am32100-8c6m-400w.png" alt="Screenshot20251201at122141AM32100" className="articles-thq-screenshot20251201at122141am3-elm" />
            <img src="/screenshot20251201at122141am42119-u58b-400w.png" alt="Screenshot20251201at122141AM42119" className="articles-thq-screenshot20251201at122141am4-elm" />
            <span className="articles-thq-text-elm24">Title</span>
            <span className="articles-thq-text-elm25">read more</span>
            <span className="articles-thq-text-elm26">Title</span>
            <span className="articles-thq-text-elm27">read more</span>
            <span className="articles-thq-text-elm28">Title</span>
            <img src="/rectangle2119-bkbi-400w.png" alt="Rectangle2119" className="articles-thq-rectangle-elm3" />
            <img src="/rectangle2119-4uq8-400w.png" alt="Rectangle2119" className="articles-thq-rectangle-elm4" />
            <img src="/screenshot20251201at122141am52119-2bbl-400w.png" alt="Screenshot20251201at122141AM52119" className="articles-thq-screenshot20251201at122141am5-elm" />
            <span className="articles-thq-text-elm29">Title</span>
            <span className="articles-thq-text-elm30">read more</span>
            <span className="articles-thq-text-elm31">Title</span>
            <span className="articles-thq-text-elm32">read more</span>
            <span className="articles-thq-text-elm33">Title</span>
            <span className="articles-thq-text-elm34">read more</span>
            <span className="articles-thq-text-elm35">read more</span>
            <img src="/screenshot20251201at122141am22097-8kx-300w.png" alt="Screenshot20251201at122141AM22097" className="articles-thq-screenshot20251201at122141am2-elm" />
            <span className="articles-thq-text-elm36">Title</span>
            <span className="articles-thq-text-elm37">Title</span>
            <span className="articles-thq-text-elm38">read more</span>
            <span className="articles-thq-text-elm39">read more</span>
            <span className="articles-thq-text-elm40">Title</span>
            <span className="articles-thq-text-elm41">read more</span>
            <img src="/screenshot20251201at122129am12097-x335-300w.png" alt="Screenshot20251201at122129AM12097" className="articles-thq-screenshot20251201at122129am1-elm" />
            <span className="articles-thq-text-elm42">Specific Topics</span>
            <span className="articles-thq-text-elm43">Apply to be an Editor</span>
            <span className="articles-thq-text-elm44">Trending <span dangerouslySetInnerHTML={{ __html: ' ' }} /></span>
            <img src="/screenshot20251205at12541pm22100-ktms-1300h.png" alt="Screenshot20251205at12541PM22100" className="articles-thq-screenshot20251205at12541pm2-elm" />

            {/* ARTICLE SUBMISSION FORM */}
            <span className="articles-thq-text-elm45">Write your own article <span dangerouslySetInnerHTML={{ __html: ' ' }} /></span>

            <form onSubmit={handleSubmit} className="articles-submission-form">
              <input
                className="articles-form-input"
                type="text"
                name="author_name"
                placeholder="Author Name"
                value={formData.author_name}
                onChange={handleChange}
                required
              />
              <input
                className="articles-form-input"
                type="text"
                name="title"
                placeholder="Title here"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                className="articles-form-textarea"
                name="article_body"
                placeholder="Article here..."
                value={formData.article_body}
                onChange={handleChange}
                required
              />
              <input
                className="articles-form-input"
                type="text"
                name="image_source"
                placeholder="Image Source"
                value={formData.image_source}
                onChange={handleChange}
              />
              <div className="articles-form-upload">
                <label className="articles-form-upload-label">
                  📎 Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {imageFile && <span className="articles-form-filename">{imageFile.name}</span>}
              </div>

              <button type="submit" className="articles-form-submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Submitting...' : 'Submit Article'}
              </button>

              {status === 'success' && (
                <p className="articles-form-success">✅ Article submitted successfully! We'll review it soon.</p>
              )}
              {status === 'error' && (
                <p className="articles-form-error">❌ Something went wrong. Please try again.</p>
              )}
            </form>

            <button className="articles-thq-articlebutton-elm1">
              <img src="/rectangle6i2100-6yh-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm1" />
              <span className="articles-thq-text-elm51">Elections</span>
            </button>
            <button className="articles-thq-articlebutton-elm2">
              <img src="/rectangle6i2100-e6mb-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm2" />
              <span className="articles-thq-text-elm52">Technology</span>
            </button>
            <button className="articles-thq-articlebutton-elm3">
              <img src="/rectangle6i2100-4odj-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm3" />
              <span className="articles-thq-text-elm53">LGBTQ+ Rights</span>
            </button>
            <button className="articles-thq-articlebutton-elm4">
              <img src="/rectangle6i2100-xc2q-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm4" />
              <span className="articles-thq-text-elm54">Immigration</span>
            </button>
            <button className="articles-thq-articlebutton-elm5">
              <img src="/rectangle6i2100-8uk-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm5" />
              <span className="articles-thq-text-elm55">Womens Rights</span>
            </button>
            <button className="articles-thq-articlebutton-elm6">
              <img src="/rectangle6i2100-j23-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm6" />
              <span className="articles-thq-text-elm56">Media</span>
            </button>
            <button className="articles-thq-articlebutton-elm7">
              <img src="/rectangle6i2100-j3u-200h.png" alt="Rectangle6I2100" className="articles-thq-rectangle6-elm7" />
              <span className="articles-thq-text-elm57">Other</span>
            </button>
            <div className="articles-thq-frame8-elm">
              <span className="articles-thq-text-elm58">Women&apos;s Rights</span>
            </div>
            <div className="articles-thq-star9-elm1"><img src="/star9i2257-zxtk.svg" alt="Star9I2257" className="articles-thq-star9-elm2" /></div>
            <div className="articles-thq-star10-elm"><img src="/star9i2257-txl.svg" alt="Star9I2257" className="articles-thq-star9-elm3" /></div>
            <div className="articles-thq-star9-elm4"><img src="/star9i2257-45wh.svg" alt="Star9I2257" className="articles-thq-star9-elm5" /></div>
            <div className="articles-thq-star11-elm"><img src="/star9i2257-tzbi.svg" alt="Star9I2257" className="articles-thq-star9-elm6" /></div>
            <div className="articles-thq-star12-elm"><img src="/star9i2257-n7n9.svg" alt="Star9I2257" className="articles-thq-star9-elm7" /></div>
            <div className="articles-thq-star13-elm"><img src="/star9i2257-gxif.svg" alt="Star9I2257" className="articles-thq-star9-elm8" /></div>
            <span className="articles-thq-text-elm59">
              Lorem ipsum dolor sit amet consectetur. Nam sollicitudin etiam
              bibendum fringilla blandit. Ornare venenatis felis sit est turpis.
              Dignissim dictum istique felis. Faucibus non amet sollicitudin sodales
              sit sit. Velit vitae aenean viverra dictum imperdiet eget neque.
            </span>
            <div className="articles-thq-frame10-elm">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfuuaCMNg97SzXs_k4dkyE-omf8jWw0x7CsjsVOSclM9lM_BA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="articles-thq-text-elm60"
              >
                Apply here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Articles