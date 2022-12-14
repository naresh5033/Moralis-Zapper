import React from "react";
import { useState, useEffect } from "react";
import "../App.css";

/*this comp will combine the native currency, tkn bal of the wallet and 
give us the combine portfolio of the particular wallet */
function PortfolioValue({ tokens, nativeValue }) {
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let val = 0;
    for (let i = 0; i < tokens.length; i++) {
      val = val + Number(tokens[i].val); //every token from the tkns [] has key called val-> usd price val for the tkn
    }
    val = val + Number(nativeValue); //lly for the native currency but outside of the loop, i.e tkn[]

    setTotalValue(val.toFixed(2)); //finally set the total val for both tkn and native currency
  }, [nativeValue, tokens]);

  return (
    <>
      <div className="totalValue">
        <h3>Portfolio Total Value</h3>
        <h2>${totalValue}</h2>
      </div>
    </>
  );
}

export default PortfolioValue;
