import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline"; // Add CssBaseline
import ExpenseSplit from "./contracts/ExpenseSplit.json";
import SharedFunds from "./contracts/SharedFunds.json";
import Web3 from "web3";
import Header from "./components/Header";
import SecondaryHeader from "./components/SecondaryHeader";
import Dues from "./components/Dues";

import "./App.css";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ExpenseTable from "./components/ExpenseTable";
import Table2 from "./components/Table2";

function App() {
  const [data, setData] = useState([]);
  const [state2, setState2] = useState({
    web3: null,
    contract: null,
  });
  const [dues, setDues] = useState({
    amtYouOwe : 0, 
    amtYouAreOwed:0
  })
  const [debtsMap, setDebtsMap] = useState({}); // Map of person to amount you owe
  const [NFTTokenIDs, setNFTTokenIDs] = useState({}); // Map of person to nft expense bill
  const[DID, setDID] = useState("")
  let expenseLength;
  let contract;


  const getBalance = async (contract, address) => {
    try {
      const balance = await contract.methods
        .getSharedToken()
        .balanceOf(address)
        .call();
      console.log("Balance is:", balance);
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };



  const connectToMetaMask = async () => {
    try {
     
      if (!window.ethereum) {
        console.error("MetaMask not detected");
        return;
      }
      // const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider());

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
  
     
      const web3 = new Web3(window.ethereum);

      if (typeof web3 === "undefined") {
        throw new Error("MetaMask not detected");
      }

      const newAccount = accounts[0];
      web3.eth.defaultAccount = newAccount;
      setDID(web3.eth.defaultAccount)
      const networkId = Number(await web3.eth.net.getId());
      const deployedNetwork = ExpenseSplit.networks[networkId];
      if (!deployedNetwork) {
        throw new Error("Contract not deployed on the current network");
      }

      contract = new web3.eth.Contract(
        ExpenseSplit.abi,
        deployedNetwork.address
      );

      setState2({ web3, contract });
      
   
    expenseLength = await contract.methods.getExpensesCount().call();
    expenseLength = Number(expenseLength);

    const creditor = web3.eth.defaultAccount;
    const sharedTokenAddress = await contract.methods.getSharedToken().call();
    const sharedTokenContract = new web3.eth.Contract(
      SharedFunds.abi,
      sharedTokenAddress
    );
    const result = await contract.methods.totaldebts(creditor).call({ from: creditor });
    // console.log(result[0]);
    const amtYouOwe = Number(result[0]);
    const amtYouAreOwed = Number(result[1]);
    setDues({
      amtYouOwe:amtYouOwe, 
      amtYouAreOwed
    })

    console.log(creditor);
    // 0          1             2               3           4
    //purposes, totalAmounts, individualShares, creditors, participants
     const data2 = await contract.methods
      .getParticipantAllExpensesDetails(creditor)
      .call();
   
    //console.log("Totaldata", data2);
    const peopleYouOwe = data2[3]
    //console.log(peopleYouOwe);
    const newDebtsMap = {};

    //creditor as in you
    for(const i in peopleYouOwe){
      const person = peopleYouOwe[i]
      const amountOwed = await contract.methods
      .getAmountOwed(creditor, person)
      .call();

      const NFTID= await contract.methods
      .getNFTDetails(creditor, person)
      .call();
      
      const debtDetails = {
        amountOwed: Number(amountOwed),
        NFTID:  Number(NFTID),
      };
    
      // Store the debtDetails object in the newDebtsMap
      if (amountOwed > 0) {
        newDebtsMap[person] = debtDetails;
      }
    }
    console.log(newDebtsMap);
    setDebtsMap(newDebtsMap);

    const arr = [];
    for (let i = 0; i < expenseLength; i++) {
      const expense = await contract.methods.expenses(i).call();
      const newExpense = {
        ...expense,
        amount: Number(expense.amount),
      };
      arr.push(newExpense);
    }
    setData(arr)
    
    } catch (error) {
      console.error("Error detecting Ethereum provider:", error);
    }
  };

  window.ethereum.on("accountsChanged", (accounts) => {
    console.log("Accounts changed");
    connectToMetaMask();
  });

  useEffect(() => {
    connectToMetaMask();
    
  }, []);

  // Create a dark theme
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Add CssBaseline to apply default styles */}
      <Router>
        <div>
          <Header />
          <SecondaryHeader dues={dues} debtsMap={debtsMap} DID={DID}/>
          <main>
            <div>
            <Routes>
              <Route
                path="/"
                element={
                  <ExpenseTable
                    data={data}
                    web3={state2.web3}
                    contract={state2.contract}
                  />
                }
              />
               <Route
                path="/popup"
                element={
                  <Table2
                   
                  />
                }
              />
             
            </Routes>

            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
