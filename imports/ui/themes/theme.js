import { createMuiTheme } from 'material-ui/styles'

const fontWeightMedium = 500

export default createMuiTheme({
  palette: {
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
    // Use the system font.
    fontFamily: 'Roboto, sans-serif',
    fontWeightMedium,
    body1: {
      fontWeight: fontWeightMedium,
    },
    button: {
      fontFamily: '"Supermercado One", cursive',
      textTransform: 'initial',
      fontWeight: 400,
      fontSize: '1.25rem',
    },
  },
})
