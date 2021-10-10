import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('NFTMarket', function () {
  it('Should create and execute market sales', async function () {
    const Market = await ethers.getContractFactory('NFTMarket')
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    const listingPrice = await (await market.getListingPrice()).toString()

    const auctionPrice = ethers.utils.parseUnits('10', 'ether')

    await nft.createToken('https://www.mytokenlocation.com')
    await nft.createToken('https://www.mytokenlocation2.com')

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice,
    })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice,
    })

    const [_, buyerAddress] = await ethers.getSigners()

    await market
      .connect(buyerAddress)
      .createMarketSale(nftContractAddress, 1, { value: auctionPrice })

    const items = await market.fetchMarketItems()

    const humandReadableItems = await Promise.all(
      items.map(async (item) => {
        const tokenUri = await nft.tokenURI(item.tokenId)
        const newItem = {
          price: item.price.toString(),
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: item.owner,
          tokenUri,
        }
        return newItem
      })
    )
    console.log('itemes: ', humandReadableItems)

    expect(items.length).to.equal(1)
  })
})
