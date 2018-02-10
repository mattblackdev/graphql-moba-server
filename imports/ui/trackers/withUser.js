import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'

export default withTracker(() => {
  const usersSub = Meteor.subscribe('users')
  return {
    user: Meteor.user(),
    usersReady: usersSub.ready(),
  }
})
