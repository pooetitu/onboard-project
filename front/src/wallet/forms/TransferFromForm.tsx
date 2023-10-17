import {useState} from "react";
import {parseUnits} from "viem";
import {Button, FormControl, Stack, TextField} from "@mui/material";

export default function TransferFromForm({contract, busdDecimals}: { contract: any, busdDecimals: number }) {
  const [from, setFrom] = useState<string>();
  const [to, setTo] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const onTransferFrom = async (event: any) => {
    event.preventDefault();
    if (amount) {
      try {
        await contract.write.transferFrom([from, to, parseUnits(amount, busdDecimals)]);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return (
    <FormControl>
      <Stack spacing={2} direction="row">

        <TextField label="Spender Address" variant={"filled"} size={"small"}
                   onChange={event => setFrom(event.target.value)}/>
        <TextField label="Recipient address" variant={"filled"} size={"small"}
                   onChange={event => setTo(event.target.value)}/>
        <TextField label="Amount" variant={"filled"} size={"small"}
                   onChange={event => setAmount(event.target.value)}/>
        <Button variant="outlined" size={"small"} onClick={onTransferFrom}>Transfer From</Button>
      </Stack>
    </FormControl>
  );
}
