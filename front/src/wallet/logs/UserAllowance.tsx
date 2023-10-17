import Container from "@mui/material/Container";
import {Stack, Tooltip, Typography} from "@mui/material";
import * as React from "react";
import {Allowance} from "../../types/allowance";
import {formatUnits} from "viem";

export default function UserAllowance({approvals, busdDecimals}: {
  approvals: Allowance[],
  busdDecimals: number
}) {
  const userApprovals = approvals.map(log =>
    <Stack direction={'row'} spacing={2}>
      <Tooltip title={'' + log.sender}>
        <Typography minWidth={150} noWrap={true}>{`sender: ${log.sender}`}</Typography>
      </Tooltip>
      <Tooltip title={'' + formatUnits(BigInt(log.value), busdDecimals)}>
        <Typography minWidth={150} noWrap={true}>{`amount: ${formatUnits(BigInt(log.value), busdDecimals)}`}</Typography>
      </Tooltip>
    </Stack>
  );

  return (
    <Container sx={{bgcolor: '#cfe8fc'}}>
      <Typography>
        Your approved addresses
      </Typography>
      <Stack direction={"column"}
             sx={{overflow: 'auto', height: '250px', maxHeight: '250px'}}>
        {userApprovals}
      </Stack>
    </Container>);
}