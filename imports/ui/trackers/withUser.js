import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'

export default withTracker(() => ({
  user: Meteor.user(),
}))
