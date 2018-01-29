import { Meteor } from 'meteor/meteor'
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import Typography from 'material-ui/Typography'
import Menu, { MenuItem } from 'material-ui/Menu'
import AccountCircle from 'material-ui-icons/AccountCircle'

class UserMenu extends Component {
  static propTypes = {
    displayText: PropTypes.string.isRequired,
  }
  state = {
    anchorEl: null,
    open: false,
  }
  render() {
    return (
      <Fragment>
        <Typography>{this.props.displayText}</Typography>
        <IconButton
          onClick={e =>
            this.setState({ anchorEl: e.currentTarget, open: true })
          }
          color="contrast"
          ref={ref => {
            this.anchorEl = ref
          }}>
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.open}
          onRequestClose={() => this.setState({ anchorEl: null, open: false })}>
          <MenuItem onClick={() => Meteor.logout()}>Logout</MenuItem>
        </Menu>
      </Fragment>
    )
  }
}

export default UserMenu
