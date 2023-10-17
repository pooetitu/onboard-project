import {useState} from "react";
import {parseUnits} from "viem";
import {Button, FormControl, Stack, TextField} from "@mui/material";

export default function ApproveForm({contract, busdDecimals}: { contract: any, busdDecimals: number }) {
  const [spender, setSpender] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const onApprove = async (event: any) => {
    event.preventDefault();
    if (amount) {
      try {
        await contract.write.approve([spender, parseUnits(amount, busdDecimals)]);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return (
    <FormControl>
      <Stack spacing={2} direction="row">
        <TextField label="Spender" variant={"filled"} size={"small"}
                   onChange={event => setSpender(event.target.value)}/>
        <TextField label="Amount" variant={"filled"} size={"small"}
                   onChange={event => setAmount(event.target.value)}/>
        <Button variant="outlined" size={"small"} onClick={onApprove}>Approve</Button>
      </Stack>
    </FormControl>
  );
}
