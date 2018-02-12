export default string =>
  string.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
