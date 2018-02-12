import React, { Fragment } from 'react'
import moment from 'moment'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import Card, { CardActions, CardContent } from 'material-ui/Card'
import Chip from 'material-ui/Chip'
import {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
} from 'material-ui/ExpansionPanel'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import Divider from 'material-ui/Divider'

import capitilize from '/imports/utils/capitilize'
import { GameStatus } from '/imports/api/classes'
import Interval from './Interval'
import TeamDialog from './TeamDialog'
import ClassSelectionDialog from './ClassSelectionDialog'
import DarkExpansionPanel from './DarkExpansionPanel'

function TimeRemaining(props) {
  const { game } = props
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
}

function PlayerSecret(props) {
  const { game } = props
  const player = game.getUserPlayer()
  if (!player) return null
  return <Typography>Secret: {player.secret}</Typography>
}

function GameStatusBar(props) {
  const { game } = props
  const status = game.getStatus()
  switch (status) {
    case GameStatus.WAITING:
      return <Typography>Waiting</Typography>
    case GameStatus.STARTED:
      return (
        <Fragment>
          <TimeRemaining {...props} />
          <PlayerSecret {...props} />
        </Fragment>
      )
    default:
      return null
  }
}

const Teams = props => {
  const { game, gameIsLocked } = props
  const player = game.getUserPlayer()
  return (
    <Fragment>
      <Typography>Teams</Typography>
      {!gameIsLocked && (
        <TeamDialog addTeam={(...args) => game.addTeam(...args)} />
      )}
      {game.teams.map(team => {
        const isMyTeam = player && player.teamId === team._id
        return (
          <DarkExpansionPanel key={team._id} defaultExpanded={isMyTeam}>
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
              {!gameIsLocked && (
                <Fragment>
                  {!isMyTeam && (
                    <Button onClick={() => game.joinTeam(team._id)}>
                      Join
                    </Button>
                  )}
                </Fragment>
              )}
            </ExpansionPanelActions>
          </DarkExpansionPanel>
        )
      })}
    </Fragment>
  )
}

function PlayerChip(props) {
  const { player } = props
  const { username } = player.getUser()
  const clazzName = player.class ? `: ${player.class.name}` : ''

  const label = `${username}${clazzName}`
  return <Chip label={label} style={{ margin: 8 }} />
}

function GameContent(props) {
  const { game, gameIsMine } = props
  return (
    <CardContent>
      <Typography
        variant="subheading"
        color={gameIsMine ? 'secondary' : undefined}
      >
        {game.name}
      </Typography>
      <GameStatusBar {...props} />
      <Teams {...props} />
    </CardContent>
  )
}

const GameOwnerButtons = ({ game, gameIsLocked, admin, isGameOwner }) => {
  if (!admin && !isGameOwner) return null
  if (gameIsLocked) {
    return (
      <Button
        onClick={() => {
          if (window.confirm('Kill this game?')) {
            game.stop()
          }
        }}
      >
        Kill
      </Button>
    )
  }
  return <Button onClick={() => game.start()}>Start</Button>
}

function Game(props) {
  const { game, gameIsMine, gameIsLocked } = props
  return (
    <Card style={{ maxWidth: 800 }}>
      <GameContent {...props} />
      <CardActions>
        <GameOwnerButtons {...props} />
        {gameIsMine && (
          <Fragment>
            <Button onClick={() => game.leaveGame()}>Leave</Button>
            {!gameIsLocked && <ClassSelectionDialog {...props} />}
          </Fragment>
        )}
      </CardActions>
    </Card>
  )
}

export default Game
