import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Button from 'material-ui/Button'

import UserMenu from './UserMenu'

const AuthButtons = withRouter(({ history }) => (
  <Fragment>
    <Button color="secondary" onClick={() => history.push('/signup')}>
      Signup
    </Button>
    <Button color="inherit" onClick={() => history.push('/login')}>
      Login
    </Button>
  </Fragment>
))

const BrandButton = withRouter(({ history }) => (
  <Button type="title" color="inherit" onClick={() => history.push('/')}>
    GraphQ League
  </Button>
))

function Header(props) {
  const { user } = props
  return (
    <AppBar position="static">
      <Toolbar>
        <span style={{ flex: 1 }}>
          <BrandButton />
        </span>
        {user ? <UserMenu displayText={user.username} /> : <AuthButtons />}
      </Toolbar>
    </AppBar>
  )
}

export default Header
