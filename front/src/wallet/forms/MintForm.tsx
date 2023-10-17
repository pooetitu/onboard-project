import {useState} from "react";
import {parseUnits} from "viem";
import {Button, FormControl, Stack, TextField} from "@mui/material";

export default function MintForm({contract, busdDecimals}: { contract: any, busdDecimals: number }) {
  const [amount, setAmount] = useState<string>();
  const onMint = async (event: any) => {
    event.preventDefault();
    if (amount) {
      try {
        await contract.write.mint([parseUnits(amount, busdDecimals)]);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return (
    <FormControl>
      <Stack spacing={2} direction="row">
        <TextField label="Amount" variant={"filled"} size={"small"}
                   onChange={event => setAmount(event.target.value)}/>
        <Button variant="outlined" size={"small"} onClick={onMint}>Mint</Button>
      </Stack>
    </FormControl>
  );
}
