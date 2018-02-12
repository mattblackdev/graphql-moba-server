import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'

function userIsAdmin() {
  return Roles.userIsInRole(Meteor.user(), ['admin'], 'default-group')
}

export default userIsAdmin
