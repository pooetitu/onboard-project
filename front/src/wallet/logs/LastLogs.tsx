import {Stack, Tooltip, Typography} from "@mui/material";
import {Transfer} from "../../types/transfer";
import {formatUnits} from "viem";
import {Allowance} from "../../types/allowance";
import * as React from "react";
import Container from "@mui/material/Container";

export default function LastLogs({lastLogs, busdDecimals}: {
  lastLogs: (Allowance | Transfer)[],
  busdDecimals: number
}) {
  const logs =
    lastLogs.map(log =>
      <Stack direction={'row'} spacing={2}>
        <Typography>{log.type}: </Typography>
        {
          log.type === 'Transfer' ?
            <>
              <Tooltip title={(log as Transfer).from}>
                <Typography minWidth={150} noWrap={true}>{`From: ${(log as Transfer).from}`}</Typography>
              </Tooltip>
              <Tooltip title={(log as Transfer).to}>
                <Typography minWidth={150} noWrap={true}>{`To: ${(log as Transfer).to}`}</Typography>
              </Tooltip>
              <Tooltip title={formatUnits(BigInt((log as Transfer).value), busdDecimals)}>
                <Typography minWidth={150}
                            noWrap={true}>{'Amount: ' + formatUnits(BigInt((log as Transfer).value), busdDecimals)}</Typography>
              </Tooltip>
            </>
            :
            <>
              <Tooltip title={(log as Allowance).owner}>
                <Typography minWidth={150} noWrap={true}>{`From: ${(log as Allowance).owner}`}</Typography>
              </Tooltip>
              <Tooltip title={(log as Allowance).sender}>
                <Typography minWidth={150} noWrap={true}>{`Spender: ${(log as Allowance).sender}`}</Typography>
              </Tooltip>
              <Tooltip title={formatUnits(BigInt((log as Allowance).value), busdDecimals)}>
                <Typography minWidth={150}
                            noWrap={true}>{'Amount: ' + formatUnits(BigInt((log as Allowance).value), busdDecimals)}</Typography>
              </Tooltip>
            </>
        }
      </Stack>
    );
  return (
    <Container sx={{bgcolor: '#cfe8fc'}}>
      <Typography>
        Last 10 actions
      </Typography>
      <Stack direction={"column"}
             sx={{overflow: 'auto', height: '250px', maxHeight: '250px'}}>
        {logs}
      </Stack>
    </Container>);
}