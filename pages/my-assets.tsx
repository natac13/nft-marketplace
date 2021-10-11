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

const client = ipfsHttpClient({ url: 'https://ipfs.infura.io:5001/api/v0' })

export interface MyAssetsPageProps {}

const MyAssets: React.FC<MyAssetsPageProps> = (props) => {
  const {} = props
  const [nfts, setNfts] = React.useState([])
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
    const data = await marketContract.fetchMyNFTs()

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
          description: meta.data.description,
        }
        return returnItem
      })
    )
    setNfts(items)
    setLoadingState('loaded')
  }

  React.useEffect(() => {
    loadNFTs()
  }, [])

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center">
          You do not own NFTs, go get some
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
          My Assets
        </Typography>
      </Box>
      <Box sx={{ my: 4 }}>
        <Grid container>
          {nfts.map((nft, i) => (
            <Grid item xs={12} sm={4} lg={3} key={nft.name}>
              <Card>
                <CardMedia component="img" image={nft.image}></CardMedia>
                <CardHeader title={nft.name} />
                <CardContent>{nft.description}</CardContent>
                <CardActions>
                  <Typography>{nft.price} Matic</Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default MyAssets
