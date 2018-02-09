import { Meteor } from 'meteor/meteor'
import React, { Component, Fragment } from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { Roles } from 'meteor/alanning:roles'
import moment from 'moment'
import Typography from 'material-ui/Typography'
import Grid from 'material-ui/Grid'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import Card, { CardActions, CardContent } from 'material-ui/Card'
import Toolbar from 'material-ui/Toolbar'
import Paper from 'material-ui/Paper'
import AddIcon from 'material-ui-icons/Add'

import { Game } from '/imports/api/classes'
import Interval from './Interval'

function PublicHome() {
  return (
    <div style={{ marginTop: 256, textAlign: 'center' }}>
      <Typography variant="display1" gutterBottom>
        Learn GraphQL by Pwning n00bs
      </Typography>
    </div>
  )
}

function GameList(props) {
  console.log(props)
  return (
    <Fragment>
      <Toolbar style={{ marginBottom: 24 }}>
        <Typography variant="headline" style={{ flex: 1 }}>
          Games
        </Typography>
        {props.admin && (
          <IconButton onClick={() => new Game().create('From UI')}>
            <AddIcon />
          </IconButton>
        )}
      </Toolbar>
      <Grid container>
        {props.games.map(game => (
          <Grid item key={game._id}>
            <Card>
              <Typography>{game.name}</Typography>
              {game.startTime ? (
                <Fragment>
                  <CardContent>
                    <Interval
                      interval={60000}
                      run={() => ({ time: moment(game.startTime).fromNow() })}
                      render={({ time }) => (
                        <Typography>Started {time}</Typography>
                      )}
                    />
                  </CardContent>
                  <CardActions>
                    {props.admin && <Button>Stop</Button>}
                  </CardActions>
                </Fragment>
              ) : (
                <Fragment>
                  <CardContent>
                    <Typography>Waiting</Typography>
                    <Typography>Teams: {game.teams.length}</Typography>
                  </CardContent>
                  <CardActions>
                    {props.admin && (
                      <Button onClick={() => game.start()}>Start</Button>
                    )}
                    {!props.user.gameId && (
                      <Button onClick={() => game.addTeam('red')}>Join</Button>
                    )}
                  </CardActions>
                </Fragment>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Fragment>
  )
}

function Loading() {
  return null
}

function Home(props) {
  if (props.loggingIn) return <Loading />
  if (!props.user) return <PublicHome />

  return <GameList {...props} />
}

export default withTracker(({ user }) => {
  const gamesSub = Meteor.subscribe('allGames')
  const games = Game.find().fetch()
  let props = {}
  if (user) {
    // const players = Players.find({}).fetch()
    const admin = Roles.userIsInRole(user, ['admin'], 'default-group')
    props = {
      // players,
      admin,
    }
  }
  return {
    ...props,
    loggingIn: Meteor.loggingIn(),
    gamesReady: gamesSub.ready(),
    games,
  }
})(Home)
