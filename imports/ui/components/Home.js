import React, { Fragment } from 'react'
import Typography from 'material-ui/Typography'
import Grid from 'material-ui/Grid'
import IconButton from 'material-ui/IconButton'
import Toolbar from 'material-ui/Toolbar'
import AddIcon from 'material-ui-icons/Add'

import capitilize from '/imports/utils/capitilize'
import { Game as G4me } from '/imports/api/classes'
import withGames from '../trackers/withGames'
import Game from './Game'

function PublicHome() {
  return (
    <div
      style={{
        marginTop: 'calc(50vh - 80px)',
        textAlign: 'center',
        padding: 4,
      }}
    >
      <Typography variant="display2" gutterBottom>
        Learn GraphQL by Pwning n00bs
      </Typography>
    </div>
  )
}

function GameList(props) {
  const { games, user, ...rest } = props
  return (
    <Fragment>
      <Toolbar style={{ marginBottom: 8, marginTop: 8 }}>
        <Typography variant="headline" style={{ flex: 1 }}>
          Games
        </Typography>
        <IconButton
          onClick={() =>
            new G4me().create(`${capitilize(user.username)}'s Game`)
          }
        >
          <AddIcon />
        </IconButton>
      </Toolbar>
      <Grid container spacing={0} justify="center">
        {props.games.map(game => (
          <Grid
            item
            xs={12}
            style={{ marginBottom: 48, maxWidth: 600 }}
            key={game._id}
          >
            <Game
              {...rest}
              game={game}
              gameIsLocked={game.isLocked()}
              gameIsMine={user.gameId === game._id}
              gameIsOwnedByMe={user._id === game.ownerId}
            />
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
  console.log(props)
  if (props.loggingIn) return <Loading />
  if (!props.user) return <PublicHome />

  return <GameList {...props} />
}

export default withGames(Home)
