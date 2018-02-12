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
  const { game } = props
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
