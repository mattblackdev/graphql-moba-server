import React, { Fragment, Component } from 'react'
import moment from 'moment'
import Typography from 'material-ui/Typography'
import Grid from 'material-ui/Grid'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import Card, { CardActions, CardContent } from 'material-ui/Card'
import Toolbar from 'material-ui/Toolbar'
import Paper from 'material-ui/Paper'
import AddIcon from 'material-ui-icons/Add'
import Chip from 'material-ui/Chip'
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
} from 'material-ui/ExpansionPanel'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import Divider from 'material-ui/Divider'
import { withStyles } from 'material-ui/styles'

import capitilize from '/imports/utils/capitilize'
import { GameStatus } from '/imports/api/classes'
import Interval from './Interval'
import TeamDialog from './TeamDialog'
import ClassSelectionDialog from './ClassSelectionDialog'

function GameStatusBar(props) {
  const { game } = props
  const status = game.getStatus()
  switch (status) {
    case GameStatus.WAITING:
      return <Typography>Waiting</Typography>
    case GameStatus.STARTED:
      return (
        <Interval
          interval={60000}
          run={() => ({
            time: moment(game.startTime)
              .add(game.duration, 'minutes')
              .fromNow(true),
          })}
          render={({ time }) => <Typography>{time} remaining</Typography>}
        />
      )
    default:
      return null
  }
}

const Teams = withStyles(theme => ({
  expansionPanel: {
    backgroundColor: theme.palette.primary.dark,
  },
}))(props => {
  const { game, classes } = props
  const player = game.getUserPlayer()
  return (
    <Fragment>
      <Typography>Teams</Typography>
      {!game.isLocked() &&
        (props.admin || player) && (
          <TeamDialog addTeam={(...args) => game.addTeam(...args)} />
        )}
      {game.teams.map(team => {
        const isMyTeam = player && player.teamId === team._id
        return (
          <ExpansionPanel
            key={team._id}
            className={classes.expansionPanel}
            defaultExpanded={isMyTeam}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography style={{ color: team.color }}>
                {capitilize(team.color)} team
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              {game
                .playersOnTeam(team._id)
                .map(p => <PlayerChip key={p._id} player={p} />)}
            </ExpansionPanelDetails>
            <Divider />
            <ExpansionPanelActions>
              {!game.isLocked() && (
                <Fragment>
                  {player && player.teamId === team._id ? (
                    <Button onClick={() => game.leaveTeam()}>Leave</Button>
                  ) : (
                    <Button onClick={() => game.joinTeam(team._id)}>
                      Join
                    </Button>
                  )}
                </Fragment>
              )}
            </ExpansionPanelActions>
          </ExpansionPanel>
        )
      })}
    </Fragment>
  )
})

function PlayerChip(props) {
  const { player } = props
  const { username } = player.getUser()
  const clazzName = player.class ? `: ${player.class.name}` : ''

  const label = `${username}${clazzName}`
  return <Chip label={label} style={{ margin: 8 }} />
}

function Lobby(props) {
  const { game } = props
  return (
    <Fragment>
      <Typography>Lobby: {game.playersInLobby().length}</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {game
          .playersInLobby()
          .map(player => <PlayerChip key={player._id} player={player} />)}
      </div>
    </Fragment>
  )
}

function GameContent(props) {
  const { game } = props
  return (
    <CardContent>
      <Typography>{game.name}</Typography>
      <GameStatusBar {...props} />
      <Teams {...props} />
      <Lobby {...props} />
    </CardContent>
  )
}

function Game(props) {
  const { game } = props
  return (
    <Card>
      <GameContent {...props} />
      <CardActions>
        {props.admin &&
          !game.startTime && (
            <Button onClick={() => game.start()}>Start</Button>
          )}
        {!props.user.gameId &&
          !game.startTime && <Button onClick={() => game.join()}>Join</Button>}
        {props.user.gameId === game._id && (
          <Fragment>
            <Button onClick={() => game.leaveGame()}>Leave</Button>
            {!game.isLocked() && <ClassSelectionDialog {...props} />}
          </Fragment>
        )}
      </CardActions>
    </Card>
  )
}

export default Game
