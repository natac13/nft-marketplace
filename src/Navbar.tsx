import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import Link from './Link'

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = (props) => {
  const {} = props

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" component="div">
          NFT Marketplace
        </Typography>
        <Box
          sx={{
            flex: '1 0',
            display: 'flex',
            justifyContent: 'space-evenly',
          }}
        >
          <Link href="/" underline="none">
            Home
          </Link>
          <Link href="/create-item" underline="none">
            Sell Digital Asset
          </Link>
          <Link href="/my-assets" underline="none">
            My Digital Assets
          </Link>
          <Link href="/creator-dashboard" underline="none">
            Creator Dashboard
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
