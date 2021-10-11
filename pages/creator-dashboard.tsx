import * as React from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import axios from 'axios'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { nftaddress, nftmarketaddress } from '../config'
import { NFTMarket as INFTMarket, NFT as INFT } from '../typechain'

export interface CreateorDashboardPageProps {}

const CreatorDashboard: React.FC<CreateorDashboardPageProps> = (props) => {
  const {} = props
  const [nfts, setNfts] = React.useState([])
  const [sold, setSold] = React.useState([])
  const [loadingState, setLoadingState] = React.useState('not-loaded')

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const tokenContract = new ethers.Contract(
      nftaddress,
      NFT.abi,
      signer
    ) as INFT
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    ) as INFTMarket
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId)
        const meta = await axios.get(tokenUri)
        console.log({ meta })
        const price = ethers.utils.formatUnits(item.price.toString(), 'ether')
        const returnItem = {
          price,
          tokenId: item.tokenId.toNumber(),
          seller: item.seller,
          owner: item.owner,
          image: meta.data.image,
          name: meta.data.name,
          sold: item.sold,
          description: meta.data.description,
        }
        return returnItem
      })
    )
    const soldItems = items.filter((i) => i.sold)
    const notSoldItems = items.filter((i) => !i.sold)
    setNfts(notSoldItems)
    setSold(soldItems)
    setLoadingState('loaded')
  }

  React.useEffect(() => {
    loadNFTs()
  }, [])

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center">
          No items sold
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box
        component="header"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          my: 2,
        }}
      >
        <Typography variant="h1" align="center" fontWeight="700">
          Dashboard
        </Typography>
      </Box>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4">NFTs for Sale</Typography>
        <Grid container>
          {nfts.map((nft, i) => (
            <Grid item xs={12} sm={4} lg={3} key={nft.name}>
              <Card>
                <CardMedia component="img" image={nft.image}></CardMedia>
                <CardHeader title={nft.name} />
                <CardContent>{nft.description}</CardContent>
                <CardActions>
                  <Typography>{nft.price} ETH</Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4">Sold NFTs</Typography>
        <Grid container>
          {!!sold.length &&
            sold.map((nft, i) => (
              <Grid item xs={12} sm={4} lg={3} key={nft.name}>
                <Card>
                  <CardMedia component="img" image={nft.image}></CardMedia>
                  <CardHeader title={nft.name} />
                  <CardContent>{nft.description}</CardContent>
                  <CardActions>
                    <Typography>Price - {nft.price} ETH</Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default CreatorDashboard
