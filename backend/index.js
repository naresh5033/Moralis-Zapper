const Moralis = require("moralis").default;
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 8080;

//the cors mw will allow us to access numerous functionality in the browser
app.use(cors());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//the endpt to GET AMOUNT AND VALUE OF NATIVE TOKENS of wallets and chainid
app.get("/nativeBalance", async (req, res) => {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  try {
    const { address, chain } = req.query;
    //ref from moralis docs/ getNativeBalance
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address: address,
      chain: chain,
    });
    //store the res data from the getNativeBal()
    const nativeBalance = response.data;

    //b4 sending our res back, the native currency is diff acc to the chains
    let nativeCurrency;
    if (chain === "0x1") {//if its eth 
      nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //weth contract addr
   
    } else if (chain === "0x89") { //or polygon
      nativeCurrency = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; //Wmatic contract addr
    
    } else if (chain === "0x5"){//goerli
        nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //weth
      }
     else {
      if (chain === "0x13881"){//mumbai
        nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";//Wmatic
      }
    }
      //lets get the native price
    const nativePrice = await Moralis.EvmApi.token.getTokenPrice({
      address: nativeCurrency, //WETH Contract
      chain: chain,
    });
    //lets convert the native bal to the usd price
    nativeBalance.usd = nativePrice.data.usdPrice;

    res.send(nativeBalance); //now we'll finally send the res back
  } catch (e) {
    res.send(e);
  }
});

//lly for the ERC 20 tkns
//GET AMOUNT AND VALUE OF ERC20 TOKENS

app.get("/tokenBalances", async (req, res) => {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  try {
    const { address, chain } = req.query;
                                  //here the token endpt instead of bal.getBal()  
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address: address,
      chain: chain,
    });

    let tokens = response.data;

    //now that we got our tokens res, lets get only the legit(usd coins) tkns that we ve
    //we don't wana get other tkn's (ex poodle tkn) bal
    let legitTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      try {
        const priceResponse = await Moralis.EvmApi.token.getTokenPrice({
          address: tokens[i].token_address,
          chain: chain,
        });
        //check to see if the tkn is gt 0.01 then push the tkns to [], just sort out the lesser price poodle tkns
        if (priceResponse.data.usdPrice > 0.01) {
          tokens[i].usd = priceResponse.data.usdPrice;
          legitTokens.push(tokens[i]);
        } else {
          console.log("💩 coin");//the tkns that not met the condn/criteria
        }
      } catch (e) {
        console.log(e);
      }
    }
    //finally send the res to legit tkn []
    res.send(legitTokens);
  } catch (e) {
    res.send(e);
  }
});

//GET Users NFT's

app.get("/nftBalance", async (req, res) => {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  try {
    const { address, chain } = req.query;
                              //here the api endpt is nft.getwalletNfts()
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: address,
      chain: chain,
    });

    const userNFTs = response.data;
    //get the res data and send it back. check out the result[] from moralis doc
    res.send(userNFTs);
  } catch (e) {
    res.send(e);
  }
});

//GET USER's ERC20 TOKEN TRANSFERS (moralis also provides diff endpts for nft tkn transfer, native tkn transfer etc, refer moralis docs)

app.get("/tokenTransfers", async (req, res) => {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  try {
    const { address, chain } = req.query;
                                  //here is the endpt that to fetch wallet transfers
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      address: address,
      chain: chain,
    });
    //the data in res has result[] which has the raw details of all txns , but w/o metadata/decimals of the tkns 
    const userTrans = response.data.result;
    
    //so lets add the meta data to every tkn txs, and convert em readable 
    let userTransDetails = [];

    for (let i = 0; i < userTrans.length; i++) {
      try {
        const metaResponse = await Moralis.EvmApi.token.getTokenMetadata({
          addresses: [userTrans[i].address],
          chain: chain,
        });
        if (metaResponse.data) { //if we get metadata from user tx we'll create 2 keys(decimals, symbol)  
          userTrans[i].decimals = metaResponse.data[0].decimals;
          userTrans[i].symbol = metaResponse.data[0].symbol;
          userTransDetails.push(userTrans[i]); //and push em to the userTx[]
          //now we ve all the user's tx with addition decimals and symbol info for the tkns

        } else {
          console.log("no details for coin");
        }
      } catch (e) {
        console.log(e);
      }
    }
    //finally send the usetx details res
    res.send(userTransDetails);
  } catch (e) {
    res.send(e);
  }
});
