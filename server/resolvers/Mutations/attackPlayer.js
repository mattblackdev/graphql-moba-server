export function attackPlayer(root, args, context) {
  const { playerId } = args
  // console.log('ATTACK PLAYER CONTEXT', context)
  // const game = Game.findOne(context.game)
  return context.game.attackPlayer(playerId, context.player)
}
