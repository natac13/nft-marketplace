import { createTheme } from '@mui/material/styles'
import { blue, cyan, red, yellow } from '@mui/material/colors'

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: blue[500],
    },
    secondary: {
      main: yellow[800],
    },
    error: {
      main: red.A400,
    },
  },
})

export default theme
