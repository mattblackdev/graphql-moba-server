import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'
import Reboot from 'material-ui/Reboot'

import withUser from '../trackers/withUser'
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
        <Route exact path="/" render={() => <Home {...props} />} />
        <Route
          path="/login"
          render={routeProps =>
            user ? <Redirect to="/" /> : <Login {...routeProps} />
          }
        />
        <Route
          path="/signup"
          render={routeProps =>
            user ? <Redirect to="/" /> : <Signup {...routeProps} />
          }
        />
        <Route path="/" component={NotFound} />
      </Switch>
    </MuiThemeProvider>
  )
}

export default withUser(App)
