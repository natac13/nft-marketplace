import * as React from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { Box, Button, Container, TextField } from '@mui/material'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { nftaddress, nftmarketaddress } from '../config'
import { NFTMarket as INFTMarket, NFT as INFT } from '../typechain'

const client = ipfsHttpClient({ url: 'https://ipfs.infura.io:5001/api/v0' })

export interface CreateItemPageProps {}

const CreateItem: React.FC<CreateItemPageProps> = (props) => {
  const [fileUrl, setFileUrl] = React.useState('')
  const [formInput, updateFormInput] = React.useState({
    price: '',
    name: '',
    description: '',
  })
  const router = useRouter()

  const onChange = async (e) => {
    const file = e.target.files[0]
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      })
      console.log({ added })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const createSale = async (url) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftaddress, NFT.abi, signer) as INFT
    const transaction = await contract.createToken(url)
    const tx = await transaction.wait()

    const event = tx.events?.[0]
    const value = event?.args?.[2]
    const tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    ) as INFTMarket
    const listingPrice = (await marketContract.getListingPrice())?.toString()

    const transaction2 = await marketContract.createMarketItem(
      nftaddress,
      tokenId,
      price,
      { value: listingPrice }
    )
    const tx2 = await transaction2.wait()

    router.push('/')
  }

  const createItem = async () => {
    const { name, description, price } = formInput
    if (!name || !description || !price) {
      return
    }

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    })

    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createSale(url)
    } catch (e) {
      console.log({ e })
    }
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexFlow: 'column',
            justifyContent: 'center',
            gap: 3,
            mt: 3,
          }}
        >
          <TextField
            name="name"
            placeholder="Asset Name"
            label="Name"
            onChange={(e) =>
              updateFormInput((state) => ({ ...state, name: e.target.value }))
            }
          />
          <TextField
            name="description"
            placeholder="Asset Description"
            multiline
            label="Description"
            onChange={(e) =>
              updateFormInput((state) => ({
                ...state,
                description: e.target.value,
              }))
            }
          />
          <TextField
            name="price"
            placeholder="Asset Price in Matic"
            multiline
            label="Price"
            onChange={(e) =>
              updateFormInput((state) => ({ ...state, price: e.target.value }))
            }
          />
          <input type="file" label="Asset" name="asset" onChange={onChange} />
          {fileUrl && <Box component="img" width="350px" src={fileUrl} />}
          <Button onClick={createItem}>Create Asset</Button>
        </Box>
      </Box>
    </Container>
  )
}

export default CreateItem
