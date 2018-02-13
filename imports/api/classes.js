import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as Astro from 'meteor/jagi:astronomy'
import { DDP } from 'meteor/ddp-client'

import { Games, Classes, Skills } from './collections'
import userIsAdmin from './userIsAdmin'

function getUserId() {
  // eslint-disable-next-line no-underscore-dangle
  return DDP._CurrentInvocation.get().userId
}

const idField = {
  type: String,
  default: () => new Mongo.ObjectID().valueOf(),
}

export const Rating = Astro.Enum.create({
  name: 'Rating',
  identifiers: {
    TERRIBLE: 'TERRIBLE',
    POOR: 'POOR',
    DECENT: 'DECENT',
    GREAT: 'GREAT',
    SPECTACULAR: 'SPECTACULAR',
  },
})

export const Skill = Astro.Class.create({
  name: 'Skill',
  collection: Skills,
  fields: {
    _id: String,
    name: String,
    description: String,
    classIds: [String],
    cooldown: Number,
  },
})

export const Class = Astro.Class.create({
  name: 'Class',
  collection: Classes,
  fields: {
    _id: String,
    name: String,
    description: String,
    skillIds: [String], // ref
    health: Rating,
    attack: Rating,
    defense: Rating,
    speed: Rating,
  },
  helpers: {
    getHealthForLevel(level) {
      switch (this.health) {
        case Rating.POOR:
          return 90 + level * 10
        case Rating.DECENT:
          return 100 + level * 12
        case Rating.GREAT:
          return 130 + level * 13
        case Rating.SPECTACULAR:
          return 150 + level * 15
        default:
          return 100
      }
    },
    getAttackForLevel(level) {
      switch (this.attack) {
        case Rating.POOR:
          return Math.floor(2 + level * 1.2)
        case Rating.DECENT:
          return Math.floor(5 + level * 1.3)
        case Rating.GREAT:
          return Math.floor(7 + level * 1.4)
        case Rating.SPECTACULAR:
          return Math.floor(10 + level * 1.5)
        default:
          return 0
      }
    },
    getAttackCooldownForLevel(level) {
      let seconds = 1
      switch (this.speed) {
        case Rating.POOR:
          seconds = Math.floor(30 - level * 3)
          break
        case Rating.DECENT:
          seconds = Math.floor(28 - level * 3.3)
          break
        case Rating.GREAT:
          seconds = Math.floor(26 - level * 3.5)
          break
        case Rating.SPECTACULAR:
          seconds = Math.floor(25 - level * 4)
          break
        default:
          return 0
      }
      seconds = Math.max(1, seconds)
      return new Date(new Date().getTime() + 1000 * seconds)
    },
  },
})

// const itemField = {
//   type: Item,
//   optional: true,
// }

export const Cooldown = Astro.Class.create({
  name: 'Cooldown',
  fields: {
    _id: idField,
    endTime: Date,
  },
  helpers: {
    getSecondsRemaining() {
      return Math.ceil((this.endTime.getTime() - new Date().getTime()) / 1000)
    },
  },
})

export const Player = Astro.Class.create({
  name: 'Player',
  fields: {
    _id: String,
    secret: {
      type: String,
      optional: true,
    },
    name: String,
    teamId: {
      type: String,
      optional: true,
    },
    class: {
      type: Class,
      optional: true,
    },
    // location: {
    //   type: Location,
    //   optional: true,
    // },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    health: {
      type: Number,
      optional: true,
    },
    // maxHealth: statField,
    attack: {
      type: Number,
      optional: true,
    },
    // defense: statField,
    // speed: statField,
    kills: {
      type: Number,
      default: 0,
    },
    deaths: {
      type: Number,
      default: 0,
    },
    cooldown: {
      type: Cooldown,
      optional: true,
    },
    // gold: zeroField,
    // armor: itemField,
    // weapon: itemField,
    // potions: {
    //   type: [Item],
    //   default: () => [],
    // },
  },
  helpers: {
    getUser() {
      return Meteor.users.findOne(this._id)
    },
    updateLevel() {
      this.level = Math.max(1, Math.floor(this.xp / 100))
    },
  },
})

export const Location = Astro.Class.create({
  name: 'Location',
  fields: {
    _id: idField,
    name: {
      type: String,
      optional: true,
    },
    playerIds: {
      type: [String],
      default: () => [],
    },
  },
})

export const Base = Astro.Class.create({
  name: 'Base',
  fields: {
    _id: idField,
    location: {
      type: String,
      optional: true,
    },
    health: {
      type: Number,
      default: 100,
    },
  },
})

export const Team = Astro.Class.create({
  name: 'Team',
  fields: {
    _id: idField,
    color: String,
    base: {
      type: Base,
      default: () => new Base(),
    },
    ownerId: String, // FK to userId who created the game
  },
  helpers: {
    throwIfNotOwner(operationName) {
      if (this.ownerId !== getUserId()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because you are not the owner.`
        )
      }
    },
  },
})

export const GameStatus = Astro.Enum.create({
  name: 'Game Status',
  identifiers: {
    WAITING: 'WAITING',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
  },
})

export const Game = Astro.Class.create({
  name: 'Game',
  collection: Games,
  fields: {
    name: { type: String, default: 'New Game' },
    teams: { type: [Team], default: () => [] },
    players: { type: [Player], default: () => [] },
    duration: { type: Number, default: 30 },
    startTime: { type: Date, optional: true },
    endTime: { type: Date, optional: true },
    locations: { type: [String], default: () => [] }, // FK
    ownerId: String, // FK to userId who created the game
  },
  helpers: {
    getStatus() {
      if (!this.startTime) {
        return GameStatus.WAITING
      } else if (!this.endTime) {
        return GameStatus.STARTED
      }
      return GameStatus.FINISHED
    },
    isLocked() {
      return !!this.startTime
    },
    throwIfLocked(operationName) {
      if (this.isLocked()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because it has already started.`
        )
      }
    },
    throwIfNotLocked(operationName) {
      if (!this.isLocked()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because it has not started.`
        )
      }
    },
    throwIfNotOwnerOrAdmin(operationName) {
      if (userIsAdmin()) return
      if (this.ownerId !== getUserId()) {
        throw new Meteor.Error(
          'NOT_AUTHORIZED',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because you are not the owner.`
        )
      }
    },
    playersInLobby() {
      return this.players.filter(player => !player.teamId)
    },
    playersOnTeam(teamId) {
      return this.players.filter(player => player.teamId === teamId)
    },
    getUserPlayer() {
      return this.players.find(player => player._id === Meteor.userId())
    },
    getTeam(teamId) {
      return this.teams.find(t => teamId === t._id)
    },
    getPlayer(userId) {
      return this.players.find(p => p._id === userId)
    },
    attackPlayer(playerId, attackingPlayer) {
      if (
        attackingPlayer.cooldown &&
        attackingPlayer.cooldown.endTime.getTime() > new Date().getTime()
      ) {
        return {
          success: false,
          cooldown: {
            ...attackingPlayer.cooldown,
            secondsRemaining: attackingPlayer.cooldown.getSecondsRemaining(),
          },
          fromPlayer: attackingPlayer,
        }
      }
      attackingPlayer.cooldown = new Cooldown({
        endTime: attackingPlayer.class.getAttackCooldownForLevel(
          attackingPlayer.level
        ),
      })
      const player = this.getPlayer(playerId)
      player.health -= attackingPlayer.attack
      attackingPlayer.xp += 10
      if (player.health <= 0) {
        player.deaths++
        attackingPlayer.kills++
        attackingPlayer.xp += 100
        attackingPlayer.updateLevel()
        player.health = player.class.getHealthForLevel(player.level)
      }
      this.save()
      return {
        success: true,
        damage: attackingPlayer.attack,
        cooldown: {
          ...attackingPlayer.cooldown,
          secondsRemaining: attackingPlayer.cooldown.getSecondsRemaining(),
        },
        fromPlayer: attackingPlayer,
        toPlayer: player,
      }
    },
  },
  meteorMethods: {
    create(name, duration) {
      console.log('create', name)
      if (name) this.name = name
      if (duration) this.duration = duration
      this.ownerId = getUserId()
      return this.save()
    },
    start() {
      this.throwIfLocked('Start game')
      this.throwIfNotOwnerOrAdmin('Start game')
      // create locations
      this.players.forEach(player => {
        if (!player.teamId || !player.class) {
          throw new Meteor.Error('NOOP', 'Players not ready')
        }
        player.secret = `${player._id}${new Mongo.ObjectID().valueOf()}`
        player.health = player.class.getHealthForLevel(player.level)
        player.attack = player.class.getAttackForLevel(player.level)
      })
      this.startTime = new Date()
      return this.save(err => {
        if (err) console.log('Start game error', err)
      })
    },
    stop() {
      this.throwIfNotLocked('Stop game')
      this.throwIfNotOwnerOrAdmin('Stop game')
      this.endTime = new Date()
      return this.save()
    },
    addTeam(color) {
      this.throwIfLocked('Add team')
      const team = new Team({ color, ownerId: getUserId() })
      this.teams.push(team)
      this.save()
      return this.joinTeam(team._id)
    },
    joinTeam(teamId) {
      this.getTeam(teamId) // check team exists on this game
      this.throwIfLocked('Join team')
      let player = this.getUserPlayer()
      if (player) {
        player.teamId = teamId
      } else {
        const user = Meteor.user()
        if (!user) {
          throw new Meteor.Error('NOT_AUTHORIZED', 'User is not logged in.')
        }
        if (user.gameId) {
          // User is in a game already. Remove them.
          const currentGame = Game.findOne(user.gameId)
          if (currentGame) {
            try {
              currentGame.leaveTeam()
            } catch (e) {
              // do nothing
            }
          }
        }
        Meteor.users.update(user._id, { $set: { gameId: this._id } })
        player = new Player({ _id: user._id, teamId, name: user.username })
        this.players.push(player)
      }
      return this.save()
    },
    leaveGame() {
      const player = this.getUserPlayer()
      if (!player) {
        throw new Meteor.Error(
          'NOOP',
          `There is not a player in game: ${
            this.name
          } for user ${Meteor.userId()}`
        )
      }
      this.players.splice(this.players.indexOf(player), 1)
      Meteor.users.update(player._id, { $set: { gameId: null } })
      return this.save()
    },
    setClass(clazzId) {
      const player = this.getUserPlayer()
      player.class = Class.findOne(clazzId)
      return this.save()
    },
  },
})
