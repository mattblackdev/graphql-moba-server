// import { Game } from '/imports/api/collections'

export function game(root, args, context) {
  const { game } = context
  if (game) {
    game.players.forEach(player => {
      if (player.cooldown) {
        player.cooldown.secondsRemaining = Math.max(
          0,
          player.cooldown.getSecondsRemaining()
        )
      }
    })
    return game
  }
  return null
}
