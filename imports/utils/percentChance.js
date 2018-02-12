function percentChance(percent) {
  if (typeof percent !== 'number' || percent < 0 || percent > 100) {
    console.warn(
      'percentChance invalid arg: ',
      percent,
      ' Should be a number between 0 and 100'
    )
  }
  return Math.random() < percent / 100
}

export default percentChance
