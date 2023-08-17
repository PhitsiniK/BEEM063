import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import {
  Scrypt,
  ScryptProvider,
  SensiletSigner,
  ContractCalledEvent,
  ByteString,
} from "scrypt-ts";
import { Agriblock } from "../src/contracts/agriblock5"; // Make sure to import the correct contract

const contract_id = {
  /** The deployment transaction id */
  txId: "d8c8fc42ce106efef501b7596ffa5734e594eb402aae80502d127606938b2ead",
  /** The output index */
  outputIndex: 0,
};

function byteString2utf8(b: ByteString) {
  return Buffer.from(b, "hex").toString("utf8");
}

function App() {
  const [agriblockContract, setContract] = useState<Agriblock>();
  const signerRef = useRef<SensiletSigner>();
  const [error, setError] = React.useState("");

  async function fetchContract() {
    try {
      const instance = await Scrypt.contractApi.getLatestInstance(
        Agriblock,
        contract_id // Make sure to define contract_id
      );
      setContract(instance);
    } catch (error: any) {
      console.error("fetchContract error: ", error);
      setError(error.message);
    }
  }

  useEffect(() => {
    const provider = new ScryptProvider();
    const signer = new SensiletSigner(provider);

    signerRef.current = signer;

    fetchContract();

    const subscription = Scrypt.contractApi.subscribe(
      {
        clazz: Agriblock,
        id: contract_id, // Make sure to define contract_id
      },
      (event: ContractCalledEvent<Agriblock>) => {
        setContract(event.nexts[0]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setError("");
  };

  async function spend(e: any) {
    handleClose(e);
    const signer = signerRef.current as SensiletSigner;

    if (agriblockContract && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      await agriblockContract.connect(signer);
    
    }
    
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Agriblock Smart Contract Interaction</h2>
      </header>
      <TableContainer
        component={Paper}
        variant="outlined"
        style={{ width: 800, margin: "auto" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Action</TableCell>
              <TableCell align="center">Button</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">Release By Seller (0)</TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  onClick={() => spend(Agriblock.RELEASE_BY_SELLER)}
                >
                  Spend
                </Button>
              </TableCell>
            </TableRow>
            {/* Other rows */}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={error !== ""} autoHideDuration={6000} onClose={handleClose}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </div>
  );
}

export default App;