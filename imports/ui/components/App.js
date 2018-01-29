import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'
import Reboot from 'material-ui/Reboot'

import theme from '../themes/theme'
import Header from './Header'
import Home from './Home'
import Login from './Login'
import Signup from './Signup'
import NotFound from './NotFound'

function App(props) {
  const { user } = props
  return (
    <MuiThemeProvider theme={theme}>
      <Reboot />
      <Header user={user} />
      <Switch>
        <Route exact path="/" component={Home} />
        {user ? (
          <Redirect to="/" />
        ) : (
          <Fragment>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </Fragment>
        )}
        <Route path="/" component={NotFound} />
      </Switch>
    </MuiThemeProvider>
  )
}

export default withTracker(() => ({
  user: Meteor.user(),
}))(App)
