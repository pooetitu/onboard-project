import * as React from "react";
import {Component} from "react";
import {Address, formatEther, formatUnits} from "viem";
import {connectPublicClient} from "./wallet";
import ApproveForm from "./forms/ApproveForm";
import MintForm from "./forms/MintForm";
import TransferForm from "./forms/TransferForm";
import TransferFromForm from "./forms/TransferFromForm";
import BurnForm from "./forms/BurnForm";
import {Divider, Grid, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {Refresh} from "@mui/icons-material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {Transfer} from "../types/transfer";
import {Allowance} from "../types/allowance";
import LastLogs from "./logs/LastLogs";
import LastUserLogs from "./logs/LastUserLogs";
import UserAllowance from "./logs/UserAllowance";
import TransferVolume from "./logs/TransferVolume";
import {Volume} from "../types/volume";
import {io, Socket} from "socket.io-client";
import SwapForm from "./forms/SwapForm";

export default class WalletDashboard extends Component<{
  contract?: any,
  address?: Address,
  wallectClient: any,
  publicClient: any
}, {
  lastLogs: (Transfer | Allowance)[],
  userLastLogs: (Transfer | Allowance)[],
  userApprovals: Allowance[],
  volume: Volume[],
  address?: Address,
  maticBalance: bigint,
  busdBalance: bigint,
  totalSupply: bigint,
  ownerAddress: string,
  busdDecimals: number,
  mintAmount: bigint,
  transferAddress: string,
  transferAmount: bigint
}> {
  private publicClient?: any;
  private socket?: Socket;

  constructor(props: { contract?: any, address?: Address, wallectClient: any, publicClient: any }) {
    super(props);
    this.state = {
      lastLogs: [], userLastLogs: [], userApprovals: [], volume: [],
      busdBalance: BigInt(0), maticBalance: BigInt(0), totalSupply: BigInt(0), ownerAddress: '',
      busdDecimals: 0,
      mintAmount: BigInt(0), transferAddress: '', transferAmount: BigInt(0)
    };
    this.onRenounceOwnership = this.onRenounceOwnership.bind(this);
    this.onTransferOwnership = this.onTransferOwnership.bind(this);
  }

  render() {
    if (!(this.state.address)) {
      return (
        <p>
          Wallet not connected
        </p>);
    }

    return (
      <>
        {
          this.state.address &&
            <>
                <AppBar position={"static"}>
                    <Container>
                        <Toolbar disableGutters>
                            <Box sx={{flexGrow: 1}}>
                            </Box>
                            <Box>
                                <Tooltip title={this.state.address} placement={"bottom"}>
                                    <Typography maxWidth={100} noWrap={true}>{this.state.address}</Typography>
                                </Tooltip>
                            </Box>
                            <Box sx={{flexGrow: 0}}>
                                <Tooltip title="Reload data" placement={"bottom"}>
                                    <IconButton aria-label="reload"
                                                onClick={async () => this.getWalletData(this.state.address!)}>
                                        <Refresh/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
                <Stack direction={"column"} spacing={2}>
                    <Container sx={{'minWidth': '100%'}}>
                        <Grid container
                              direction="row"
                              justifyContent="center"
                              alignItems="stretch"
                              spacing={2}>
                            <Grid item xs={4}>
                                <LastLogs lastLogs={this.state.lastLogs}
                                          busdDecimals={this.state.busdDecimals}></LastLogs>
                            </Grid>
                            <Grid item xs={4}>
                                <LastUserLogs lastUserLogs={this.state.userLastLogs}
                                              busdDecimals={this.state.busdDecimals}></LastUserLogs>
                            </Grid>
                            <Grid item xs={4}>
                                <UserAllowance approvals={this.state.userApprovals}
                                               busdDecimals={this.state.busdDecimals}></UserAllowance>
                            </Grid>
                        </Grid>
                    </Container>
                    <Container sx={{'minWidth': '100%'}}>
                        <Grid container
                              direction="row"
                              justifyContent="center"
                              alignItems="stretch"
                              spacing={4}>
                            <Grid item xs={"auto"}>
                                <Container sx={{bgcolor: '#cfe8fc', height: '100%', padding: '40px'}}>
                                    <Stack
                                        divider={<Divider orientation="horizontal" flexItem/>} spacing={2}>
                                        <TransferForm contract={this.props.contract}
                                                      busdDecimals={this.state.busdDecimals}></TransferForm>
                                        <MintForm contract={this.props.contract}
                                                  busdDecimals={this.state.busdDecimals}></MintForm>
                                        <BurnForm contract={this.props.contract}
                                                  busdDecimals={this.state.busdDecimals}></BurnForm>
                                        <ApproveForm contract={this.props.contract}
                                                     busdDecimals={this.state.busdDecimals}></ApproveForm>
                                        <TransferFromForm contract={this.props.contract}
                                                          busdDecimals={this.state.busdDecimals}></TransferFromForm>
                                    </Stack>
                                </Container>
                            </Grid>
                            <Grid item xs={"auto"}>
                                <Container sx={{bgcolor: '#cfe8fc', height: '100%', padding: '40px'}}>
                                    <Box>
                                        Matic balance: {formatEther(this.state.maticBalance)}
                                    </Box>
                                    BUSD balance: {formatUnits(this.state.busdBalance, this.state.busdDecimals)}
                                    Total supply: {formatUnits(this.state.totalSupply, this.state.busdDecimals)}
                                  {
                                    this.state.address !== this.state.ownerAddress &&
                                      <Box>
                                          Contract owner
                                          <form onSubmit={this.onTransferOwnership}>
                                              <label>
                                                  New owner address
                                                  <input placeholder="0x11...11" name="owner"></input>
                                              </label>
                                              <button>Transfer ownership</button>
                                          </form>
                                          <button onClick={this.onRenounceOwnership}>Renounce ownership</button>
                                      </Box>
                                  }
                                    <SwapForm busdContract={this.props.contract} publicClient={this.props.publicClient}
                                              wallectClient={this.props.wallectClient} address={this.state.address}></SwapForm>
                                </Container>
                            </Grid>
                            <Grid item xs={"auto"}>
                                <Container sx={{bgcolor: '#cfe8fc', height: '100%'}}>
                                    <TransferVolume volume={this.state.volume}
                                                    busdDecimals={this.state.busdDecimals}></TransferVolume>
                                </Container>
                            </Grid>
                        </Grid>
                    </Container>
                </Stack>
            </>
        }
      </>
    );
  }

  componentDidMount() {
    this.publicClient = connectPublicClient();
    this.listenUpdates();
  }

  componentDidUpdate(prevProps: Readonly<{
    contract: any,
    address: Address, wallectClient: any, publicClient: any
  }>) {
    if (this.props.contract && this.props.address && prevProps.address !== this.props.address) {
      this.getWalletData(this.props.address);
    }
  }

  componentWillUnmount() {
    this.socket?.disconnect()
  }

  private listenUpdates() {
    this.socket = io('https://onboard.real-estate-executive.com', {path: '/api/socket.io'});
    this.socket.connect();
    this.socket.on('approval', (approvals: Allowance[]) => {
      this.updateLastLogs(approvals);
      this.updateUserLastLogs(approvals.filter(approval => approval.sender === this.state.address || approval.owner === this.state.address))
      this.updateAllowance(approvals);
    });
    this.socket.on('transfer', (transfers: Transfer[]) => {
      this.updateLastLogs(transfers);
      this.updateUserLastLogs(transfers.filter(transfer => transfer.to === this.state.address || transfer.from === this.state.address))
    });
  }

  private updateLastLogs(logs: (Transfer | Allowance)[]) {
    const currentLogs = this.state.lastLogs;
    currentLogs.push(...logs)
    this.setState({
      lastLogs: currentLogs.sort((a, b) =>
        Number(BigInt(b.block) - BigInt(a.block)))
        .slice(0, 10)
    });
  }

  private updateAllowance(allowances: Allowance[]) {
    let currentLogs = this.state.userApprovals;
    const newSenders = allowances.map(allowance => allowance.sender);
    currentLogs = currentLogs.filter(allowance => !newSenders.includes(allowance.sender));
    currentLogs.push(...allowances
      .filter(allowance => BigInt(allowance.value) > 0))
    this.setState({
      userApprovals: currentLogs,
    });
  }

  private updateUserLastLogs(logs: (Transfer | Allowance)[]) {
    const currentLogs = this.state.userLastLogs;
    currentLogs.push(...logs)
    this.setState({
      userLastLogs: currentLogs.sort((a, b) =>
        Number(BigInt(b.block) - BigInt(a.block)))
        .slice(0, 10)
    });
  }

  private async getWalletData(address: Address) {
    try {
      this.fetchLastActions();
      this.fetchUserLastActions(address);
      this.fetchUserApprovals(address);
      this.fetchVolume();
      const maticBalance = await this.publicClient?.getBalance({address});
      const busdDecimals = await this.props.contract.read.decimals();
      const busdBalance = await this.props.contract.read.balanceOf([address]);
      const totalSupply = await this.props.contract.read.totalSupply();
      const ownerAddress = await this.props.contract.read.owner();

      this.setState({address, maticBalance, busdBalance, busdDecimals, totalSupply, ownerAddress});
    } catch (e) {
      console.error(e);
    }
  }

  private async onRenounceOwnership(event: any) {
    event.preventDefault();
    try {
      await this.props.contract.write.renounceOwnership();
    } catch (e) {
      console.log(e);
    }
  }

  private async onTransferOwnership(value: any) {
    value.preventDefault();
    try {
      await this.props.contract.write.transferOwnership([value.owner]);
    } catch (e) {
      console.log(e);
    }
  }

  private async fetchLastActions() {
    const response = await fetch(`https://onboard.real-estate-executive.com/api/`);
    const lastLogs = await response.json();
    this.setState({
      lastLogs
    });
  }

  private async fetchUserLastActions(address: Address) {
    const response = await fetch(`https://onboard.real-estate-executive.com/api/${address}`);
    const userLastLogs = await response.json();
    this.setState({
      userLastLogs
    });
  }

  private async fetchUserApprovals(address: Address) {
    const response = await fetch(`https://onboard.real-estate-executive.com/api/allowance/${address}`);
    const userApprovals = await response.json();
    this.setState({userApprovals});
  }

  private async fetchVolume() {
    const response = await fetch(`https://onboard.real-estate-executive.com/api/volume`);
    const volume = await response.json();
    this.setState({volume});
  }
}
