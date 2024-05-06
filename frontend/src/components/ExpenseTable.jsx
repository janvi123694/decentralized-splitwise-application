import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SharedFunds from "../contracts/SharedFunds.json";
import ExpenseSplit from "../contracts/ExpenseSplit.json";
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import toast, { Toaster } from "react-hot-toast";

import {
  Navbar,
  Nav,
  Container,
  Form,
  Row,
  Col,
  Modal,
  InputGroup
} from "react-bootstrap";
import DataTable from "react-data-table-component";




const ExpenseTable = ({data, web3, contract}) => {
  const navigate = useNavigate();
  const [toggleCleared, setToggleCleared] = React.useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  // const [showSettleDebtsModal, setSettleDebtsModal] = useState(false)
  const [showBalanceOfBatchModal, setShowBalanceOfBatchModal] = useState(false)
  const [showSettleUpModal, setShowSettleUpModal] = useState(false)
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false)
  const [purpose, setPurpose] = useState(""); 
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [participants, setParticipants] = useState([""]);
  const [addressString, setAddressString] = useState("")
  const [tokenIDString, setTokenIDString] = useState("")

  const [tokens, setTokens] = useState(0)
  

const handleAddParticipant = () => {
  setParticipants((prevParticipants) => [...prevParticipants,""]);
};




const handleParticipantChange = (index, value) => {
  const updatedParticipants = [...participants];
  updatedParticipants[index] = value;
  setParticipants(updatedParticipants);
};
  
const buyTokens = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    const creditor = accounts[0];
    const weiAmount = web3.utils.toWei(tokens, "ether");

    const transaction = await contract.methods
      .buySharedFundsTokens()
      .send({ from: creditor, value: weiAmount, gas: 2000000 });

    const sharedFundsTokenAddress = await contract.methods.getSharedToken().call();
    const sharedFundsTokenContract = new web3.eth.Contract(SharedFunds.abi, sharedFundsTokenAddress);
    let balance = await sharedFundsTokenContract.methods.balanceOf(creditor).call();
    console.log("Balance after buying:", balance);

    const highAllowance = web3.utils.toWei('1000000', 'ether'); // Set a high allowance
  
    await sharedFundsTokenContract.methods
      .approve(contract.options.address, highAllowance)
      .send({ from: creditor, gas: 6000000 })
      .catch((error) => { 
        toast.error("Error in approval:");
        console.error("Error in approval:", error)
      });

    await sharedFundsTokenContract.methods.allowance(creditor).call()
  .then(function(allowance) {
    console.log(allowance);
  })
  .catch(function(error) {
    console.error("Error fetching allowance:", error);
  });

  
    // console.log(sharedFundsTokenContract.methods.allwanc)
    await contract.methods.wrapSharedFunds(1000).call();

    console.log("Tokens bought and approved successfully!");
    toast.success("Tokens bought and approved successfully!")
  } catch (error) {
    console.error("Error in transaction:", error);
  }
  closeBuyTokensMondal();
};


const handleSaveExpense = async() => {
  try {
   
  const creditor = (await web3.eth.defaultAccount);
  const expenseToAdd = {
    creditor: creditor,
    purpose: purpose,
    amount: Number(amount),
    participants: participants,
  };

 
  console.log(contract);
  
  await contract.methods
  .recordExpense(
    creditor,
    purpose,
    amount,
    participants
  )
  .send({ from: creditor  })
  .on('error', (error) => {
    toast.error(error)
    console.error("Error in sending transaction:", error);
  })
  .then((receipt) => {
    toast.success("Expense added successfully")
    console.log("Transaction receipt:", receipt);
    window.location.reload()
  });

  } catch (error) {
    toast.error(error)
    console.error("Error adding expense:", error);
  }

  
  // Close the modal after saving
  closeExpense();
};

//[0x7AcBA7aa848D6a6aAe8dBf3BF3572B9650e5E26d, 0x7AcBA7aa848D6a6aAe8dBf3BF3572B9650e5E26d]

const showBalanceOfBatch = async()=>{
  try{
    const cleanedAddressString = addressString.replace(/["[\]]/g, '');
    const cleanedTokenIDString = tokenIDString.replace(/["[\]]/g, '');
    const tempAddr = cleanedAddressString.split(",")
    const tempTokenIDS = cleanedTokenIDString.split(",")
  
    console.log(cleanedAddressString);
    console.log(tempAddr);
    const addresses= []
    const BOBTokenIDs = []
  
    
    for (const word of tempAddr) {
      const trimmedWord = word.trim();  // Remove leading and trailing white spaces
      const isValidAddress = web3.utils.isAddress(trimmedWord);
    
      console.log(isValidAddress);
    
      if (isValidAddress) {
        addresses.push(trimmedWord);
      } else {
        console.error(`${trimmedWord} is not a valid Ethereum address`);
      }
    }
  
    for (const word of tempTokenIDS) {
      const isValidInteger = /^\d+$/.test(word);
    
      if (isValidInteger) {
          BOBTokenIDs.push(parseInt(word, 10));
      } else {
        console.error(`${word} is not a valid integer`);
      }
    }
    
    const creditor = (await web3.eth.defaultAccount);
   
    console.log(creditor);
    console.log(contract.methods);
    
   const result =   await contract.methods.balanceOfBatch(["0x809bc23D15b42F56af46Cd909100AAa4F7Eb8D5a"], [1003]).call();
   const length = result.length;
    console.log("DATA IS");
    console.log(result);
    console.log(Number(length));
  
    // Close the modal after saving
  //closeBalanceOfBatchModal()

  // console.log(addresses);
  // console.log(BOBTokenIDs);
  
  } catch (error) {
    toast.error(error)
    console.error("Error adding expense:", error);
  }

  
 
};

const AddExpense = () => {
  setShowAddExpenseModal(true)
}


const closeExpense =() => {
  setShowAddExpenseModal(false);
  setCategory("")
  setPurpose("")
  setParticipants([""])
}

const [creditorAddress, setCreditorAddress] = useState("");

const handleClearDebt = async () => {
  try {
    const debtor = (await web3.eth.getAccounts())[0];
    const sharedFundsTokenAddress = await contract.methods.getSharedToken().call();
    const sharedFundsTokenContract = new web3.eth.Contract(SharedFunds.abi, sharedFundsTokenAddress);
    await contract.methods.clearDebt(creditorAddress, amount).send({ from: debtor,gas: 2000000 });

    let balance2 = await sharedFundsTokenContract.methods.balanceOf(debtor).call();
    toast.success("Debt cleared successfully. Balance after clearing the debt");
    closeSettleUpMondal(); // Close the modal after successful transaction
  } catch (error) {
    toast.error("TX Failed");
    closeSettleUpMondal()
    // console.error("Error clearing debt:", error);
  }
};

  
const renderParticipantsInputs = () => {
  return participants.map((participant, index) => (
    <InputGroup className="mb-3" key={index}>
      <Form.Control
        type="text"
        placeholder={`Participant ${index + 1}`}
        value={participant.name}
        onChange={(e) => handleParticipantChange(index, e.target.value)}
        style={{ fontSize: "14px" }}
      />
    </InputGroup>
  ));
};

const openSettleUpMondal =() =>{
  setShowSettleUpModal(true)
}

const closeSettleUpMondal =() =>{
  setShowSettleUpModal(false)
}

const transferMoney =() =>{

}

const openBuyTokensModal =() =>{
  setShowBuyTokensModal(true)
}

const openBalanceOfBatchModal=()=>{
  setShowBalanceOfBatchModal(true)
}

const closeBuyTokensMondal =() =>{
  setShowBuyTokensModal(false)
  //setTokens(0); 
}


const closeBalanceOfBatchModal =() =>{
  setShowBalanceOfBatchModal(false)
  //setTokens(0); 
}
  if (isError) return <h1>error</h1>;

  if (isLoading) return <h1>Loading...</h1>;
  const columns = [
    { field: 'creditor', headerName: 'Creditor', width: 500 },
    {
      field: 'purpose',
      headerName: 'Purpose',
      width: 300,
      editable: true,
    },
    {
      field: 'amount',
      headerName: 'Total Amount',
      width: 200,
      editable: true,
    },
    { field: 'share', headerName: 'Share', width: 200 },
  ];
  const tableData = data
  ? data.map((expense, index) => ({
      id: index + 1, // Add 1 to make it non-zero based if needed
      creditor: expense.creditor,
      purpose: expense.purpose,
      amount: Number(expense.amount),
      share:Number(expense.share)
    }))
  : [];

// console.log(tableData);


// console.log(tableData);


  //console.log(tableData);

  return (
    <>
      <Navbar expand="sm" collapseOnSelect>
          <Container>
            <Navbar.Brand className="heading">Dashboard</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </Container>
          <Container>
          <Navbar.Collapse id="basic-navbar-nav secondary-header">
              <Nav className="ms-auto">
                <Nav.Link>
                <Button 
                variant="outlined" 
                size="small"
                className="btn btn-small btn-primary" onClick={AddExpense} > Add Expense </Button>
                </Nav.Link>
                <Nav.Link>
                <Button variant="outlined" 
                size="small"
                 onClick={openSettleUpMondal} > Settle Debts </Button>
                </Nav.Link>
                <Nav.Link>
                 <Button variant="outlined" 
                size="small"
                onClick={openBuyTokensModal}> Buy Tokens </Button>
                </Nav.Link>
                <Nav.Link>
                 <Button variant="outlined" 
                size="small"
                onClick={openBalanceOfBatchModal}> Balance Of Batach </Button>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      
      <div className="expenses-table text-center" >
      <DataGrid
              rows={tableData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10]}
              checkboxSelection
              disableRowSelectionOnClick
            />
        
      </div>
       {showAddExpenseModal && (
        <Modal show={showAddExpenseModal} onHide={closeExpense} className="add-expense">
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>Add Expense</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <Form>
              <Form.Group className="mb-3" controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{fontSize:'14px'}}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="purpose">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="amount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="participants">
                <Form.Label>Participants</Form.Label>
                {participants.map((participant, index) => (
                  <InputGroup className="mb-3" key={index}>
                    <Form.Control
                      type="text"
                      placeholder={`Participant ${index + 1}`}
                      value={participant}
                      onChange={(e) => handleParticipantChange(index, e.target.value)}
                      style={{ fontSize: "14px" }}
                    />
                  </InputGroup>
                ))}
                <button
                  className="btn btn-small btn-secondary"
                  onClick={handleAddParticipant}
                  type="button"
                >
                  + Add Participant
                </button>
              </Form.Group>

                          
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-small btn-secondary" onClick={closeExpense}>
              Close
            </Button>
            <button className="btn btn-small btn-primary" onClick={handleSaveExpense}>
              Save Expense
            </button>
          </Modal.Footer>
        </Modal>
         )}

{showSettleUpModal && (
        <Modal show={showSettleUpModal} onHide={closeSettleUpMondal} className="add-expense">
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>Clear Debts</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <Form>
            <Form.Group className="mb-3" controlId="creditorAddress">
                <Form.Label>Creditor</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Creditor"
                  value={creditorAddress}
                  onChange={(e) => setCreditorAddress(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="amount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Form.Group>            
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-small btn-secondary" onClick={closeSettleUpMondal}>
              Cancel
            </Button>
            <button className="btn btn-small btn-primary" onClick={handleClearDebt}>
              Transfer
            </button>
          </Modal.Footer>
        </Modal>
         )}
         




         {/*  settle up */}
         {showBuyTokensModal&& (
        <Modal show={showBuyTokensModal} onHide={closeBuyTokensMondal} className="add-expense">
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>Buy SF Tokens </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <Form>
              <Form.Group className="mb-3" controlId="tokens">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter the number of tokens"
                  value={tokens}
                  onChange={(e) => setTokens(Number(e.target.value))}
                  style={{fontSize:'14px'}}
                />
              </Form.Group>
                          
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-small btn-secondary" onClick={closeBuyTokensMondal}>
              Close
            </Button>
            <button className="btn btn-small btn-primary" type="button" onClick={buyTokens}>
              Buy Tokens
            </button>
          </Modal.Footer>
        </Modal>
         )}

           {/*  balance of batch */}
           {showBalanceOfBatchModal && (
        <Modal show={showBalanceOfBatchModal} onHide={closeBalanceOfBatchModal} className="add-expense">
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>Balance Of Batch </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <Form>
              <Form.Group className="mb-3" controlId="tokens">
                <Form.Label style={{color:'black'}}>Addresses</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter the addresses"
                  value={addressString}
                  onChange={(e) => setAddressString(String(e.target.value))}
                  style={{fontSize:'14px'}}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="tokens">
                <Form.Label style={{color:'black'}}>Token IDs</Form.Label>
                <Form.Control
                  className="input-sm"
                  type="text"
                  placeholder="Enter the tokenIDs"
                  value={tokenIDString}
                  onChange={(e) => setTokenIDString(String(e.target.value))}
                  style={{fontSize:'14px'}}
                />
              </Form.Group>       
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-small btn-secondary" onClick={closeBalanceOfBatchModal}>
              Close
            </Button>
            <Button variant="contained" type="button" onClick={showBalanceOfBatch} sx={{marginLeft:'10px'}}>
              Show
            </Button>
          </Modal.Footer>
        </Modal>
         )}


           <Toaster />
         
    </>
  );
};



export default ExpenseTable