import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Reload } from "@web3uikit/icons";
import { Input } from "@web3uikit/core";

//the comp for fetching the wallet's nfts
function Nfts({ chain, wallet, filteredNfts, setFilteredNfts, nfts, setNfts }) {
  //we can filter the nft either by name or id
  const [nameFilter, setNameFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");

  async function getUserNfts() {
    const response = await axios.get("http://localhost:8080/nftBalance", {
      params: {
        address: wallet,
        chain: chain,
      },
    });
    //check to see if the res data has result[] then processing the nft of the res data
    if (response.data.result) {
      nftProcessing(response.data.result);
    }
  }
  //this fn will look into the metadata of the result[] and fetch the img, so we can displays it.
  function nftProcessing(t) {
    for (let i = 0; i < t.length; i++) {
      let meta = JSON.parse(t[i].metadata);
      if (meta && meta.image) { //if there is meta and img
        if (meta.image.includes(".")) { //if the meta img incl . str
          t[i].image = meta.image; //then set the meta(obj) img to our nft img
        } else { 
          t[i].image = "https://ipfs.moralis.io:2053/ipfs/" + meta.image; //meta.img -> img uri
        }
      }
    }//now that we ve imgs for all the nfts 
    setNfts(t);
    setFilteredNfts(t);
  }

  useEffect(() => { 
    if (idFilter === "" && nameFilter === "") {
      return setFilteredNfts(nfts);
    }
    //set the filter nft[]
    let filNfts = [];


    //then loop thru all the nfts
    for (let i = 0; i < nfts.length; i++) {
      if (//if there's no name fil but includes id filt, then push the nft to our filt nft []
        nfts[i].name.toLowerCase().includes(nameFilter) &&
        idFilter.length === 0
      ) {
        filNfts.push(nfts[i]);
      } else if ( //lly vise versa 
        nfts[i].token_id.includes(idFilter) &&
        nameFilter.length === 0
      ) {
        filNfts.push(nfts[i]);
      } else if ( //finally if there is both name and id filter, push the nft to [] 
        nfts[i].token_id.includes(idFilter) &&
        nfts[i].name.toLowerCase().includes(nameFilter)
      ) {
        filNfts.push(nfts[i]);
      }
    }

    setFilteredNfts(filNfts);
  }, [nameFilter, idFilter]);

  return (
    <>
      <div className="tabHeading">
        NFT Portfolio <Reload onClick={getUserNfts} />
      </div>
      <div className="filters">
        <Input
          id="NameF"
          label="Name Filter"
          labelBgColor="rgb(33, 33, 38)"
          value={nameFilter}
          style={{}}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Input
          id="IdF"
          label="Id Filter"
          labelBgColor="rgb(33, 33, 38)"
          value={idFilter}
          style={{}}
          onChange={(e) => setIdFilter(e.target.value)}
        />
      </div>
      <div className="nftList">
        {filteredNfts.length > 0 &&
          filteredNfts.map((e) => {
            return (
              <>
                <div className="nftInfo">
                  {e.image && <img src={e.image} width={200} />}

                  <div>Name: {e.name}, </div>
                  <div>(ID: {e.token_id.slice(0, 5)})</div>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
}

export default Nfts;
