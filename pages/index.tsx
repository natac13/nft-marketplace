import * as React from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { nftaddress, nftmarketaddress } from '../config'
import { NFTMarket as INFTMarket, NFT as INFT, NFTI } from '../typechain'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
} from '@mui/material'

export default function Index() {
  const [nfts, setNfts] = React.useState([])
  const [loadingState, setLoadingState] = React.useState('not-loaded')

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(
      nftaddress,
      NFT.abi,
      provider
    ) as INFT
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      provider
    ) as INFTMarket
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId)
        const meta = await axios.get(tokenUri)
        const price = ethers.utils.formatUnits(item.price.toString(), 'ether')
        const returnItem = {
          price,
          tokenId: item.tokenId.toNumber(),
          seller: item.seller,
          owner: item.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return returnItem
      })
    )
    setNfts(items)
    setLoadingState('loaded')
  }

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    ) as INFTMarket

    const price = ethers.utils.parseUnits(nft.price.toString())
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    )

    await transaction.wait()
    loadNFTs()
  }

  React.useEffect(() => {
    loadNFTs()
  }, [])

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center">
          No items in marketplace.
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
          Marketplace Home Page
        </Typography>
      </Box>
      <Box sx={{ my: 4 }}>
        <Grid container>
          {nfts.map((nft, i) => (
            <Grid item xs={12} sm={4} lg={3} key={nft.name}>
              <Card>
                <CardMedia src={nft.image}></CardMedia>
                <CardHeader>{nft.name}</CardHeader>
                <CardContent>{nft.description}</CardContent>
                <CardActions>
                  <Typography>{nft.price} Matic</Typography>
                  <Button onClick={() => buyNft(nft)}>Buy</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}
