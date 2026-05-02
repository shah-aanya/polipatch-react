import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'

import './style.css'
import HOMEPAGE from './views/homepage'
import ABOUTUS from './views/aboutus'
import Volunteer from './views/volunteer'
import Articles from './views/articles'
import Specificarticle from './views/specificarticle'
import Debates from './views/debates'
import FrameSpecificDebates from './views/frame-specific-debates'
import Source from './views/source'
import NotFound from './views/not-found'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route component={HOMEPAGE} exact path="/" />
        <Route component={ABOUTUS} exact path="/aboutus" />
        <Route component={Volunteer} exact path="/volunteer" />
        <Route component={Articles} exact path="/articles" />
        <Route component={Specificarticle} exact path="/specificarticle" />
        <Route component={Debates} exact path="/debates" />
        <Route
          component={FrameSpecificDebates}
          exact
          path="/frame-specific-debates"
        />
        <Route component={Source} exact path="/source" />
        <Route component={NotFound} path="**" />
        <Redirect to="**" />
      </Switch>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
