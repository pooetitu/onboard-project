import {useState} from "react";
import {parseUnits} from "viem";
import {Button, FormControl, Stack, TextField} from "@mui/material";

export default function TransferForm({contract, busdDecimals}: { contract: any, busdDecimals: number }) {
  const [destination, setDestination] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const onTransfer = async (event: any) => {
    event.preventDefault();
    if (amount) {
      try {
        await contract.write.transfer([destination, parseUnits(amount, busdDecimals)]);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return (
    <FormControl>
      <Stack spacing={2} direction="row">
        <TextField label="Address" variant={"filled"} size={"small"}
                   onChange={event => setDestination(event.target.value)}/>
        <TextField label="Amount" variant={"filled"} size={"small"}
                   onChange={event => setAmount(event.target.value)}/>
        <Button variant="outlined" size={"small"} onClick={onTransfer}>Transfer</Button>
      </Stack>
    </FormControl>
  );
}
