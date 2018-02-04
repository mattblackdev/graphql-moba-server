import { createMuiTheme } from 'material-ui/styles'

const gameFontFamily = '"Supermercado One", cursive'
const fontWeightMedium = 500

export default createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#6d6d6d',
      main: '#424242',
      dark: '#1b1b1b',
      contrastText: '#fff',
    },
    secondary: {
      light: '#66ffa6',
      main: '#00e676',
      dark: '#00b248',
      contrastText: '#000',
    },
  },
  typography: {
    fontWeightMedium,
    display1: {
      fontFamily: gameFontFamily,
    },
    display2: {
      fontFamily: gameFontFamily,
    },
    display3: {
      fontFamily: gameFontFamily,
    },
    display4: {
      fontFamily: gameFontFamily,
    },
    body1: {
      fontWeight: fontWeightMedium,
    },
    button: {
      fontFamily: gameFontFamily,
      textTransform: 'initial',
      fontWeight: 400,
      fontSize: '1.25rem',
    },
  },
})
