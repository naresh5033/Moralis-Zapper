import React from "react";
import axios from "axios";
import { Table } from "@web3uikit/core";
import {Reload} from '@web3uikit/icons'


function NativeTokens({
  wallet,
  chain,
  nativeBalance,
  setNativeBalance,
  nativeValue,
  setNativeValue,
}) {

  
  async function getNativeBalance() {
    //lets fetch the res frm axios but this time along with the params
    const response = await axios.get("http://localhost:8080/nativeBalance", {
      params: {
        address: wallet,
        chain: chain,
      },
    });
    //if res data has bal and usd price then set to native bal and native val
    if (response.data.balance && response.data.usd) {
      setNativeBalance((Number(response.data.balance) / 1e18).toFixed(3));
      setNativeValue( //will give the val of usd for the user's native tkn
        (
          (Number(response.data.balance) / 1e18) *
          Number(response.data.usd)
        ).toFixed(2)
      );
    }
  }

  return (
    <>
      <div className="tabHeading">Native Balance <Reload onClick={getNativeBalance}/></div>
      {(nativeBalance >0 && nativeValue >0) && 
      <Table
      pageSize={1}
      noPagination={true}
      style={{width:"900px"}}
      columnsConfig="300px 300px 250px"
      data={[["Native", nativeBalance, `$${nativeValue}`]]}
      header={[
        <span>Currency</span>,
        <span>Balance</span>,
        <span>Value</span>,
      ]}
    />
      }
      
    </>
  );
}

export default NativeTokens;