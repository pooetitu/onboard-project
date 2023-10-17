import {Component} from "react";
import {Alert, Button, FormControl, IconButton, Input, InputAdornment, InputLabel, TextField} from "@mui/material";
import {Loop} from "@mui/icons-material";
import {Address, formatUnits, parseUnits} from "viem";
import {createPairContract, createRouterContract, createWbtcContract} from "../wallet";
import {routerContract} from "../../contracts/router-contract";

interface Currency {
  name: string;
  address: Address;
  decimals: number;
  amount: string;
  contract: any;
  reserve: bigint;
  balance: bigint;
  allowance: bigint;
}

export default class SwapForm extends Component<{
  busdContract: any,
  wallectClient: any,
  publicClient: any,
  address: Address,
},
  {
    currencyIn: Currency,
    currencyOut: Currency,
    error?: string,
  }> {
  private readonly MAX_ALLOWANCE = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  private busdContract: any;
  private wbtcContract: any;
  private pairContract: any;
  private routerContract: any;
  private activeCurrency: 'currencyIn' | 'currencyOut' = 'currencyIn';
  busd: Currency;
  wbtc: Currency;

  constructor(props: any) {
    super(props);
    let {busdContract, wallectClient, publicClient} = this.props;
    this.busdContract = busdContract;
    this.wbtcContract = createWbtcContract(wallectClient, publicClient);
    this.pairContract = createPairContract(wallectClient, publicClient);
    this.routerContract = createRouterContract(wallectClient, publicClient);
    this.onCurrencyInChange = this.onCurrencyInChange.bind(this);
    this.onCurrencyOutChange = this.onCurrencyOutChange.bind(this);
    this.wbtc = {
      name: 'WBTC',
      address: this.wbtcContract.address,
      amount: '',
      decimals: 0,
      contract: this.wbtcContract,
      reserve: BigInt(0),
      balance: BigInt(0),
      allowance: BigInt(0)
    };
    this.busd = {
      name: 'BUSD',
      address: this.busdContract.address,
      amount: '',
      decimals: 0,
      contract: busdContract,
      reserve: BigInt(0),
      balance: BigInt(0),
      allowance: BigInt(0)
    };
    this.state = ({
      currencyIn: this.busd,
      currencyOut: this.wbtc
    });
  }

  async componentDidMount() {
    await this.refreshCurrencies();
  }

  private async refreshCurrencies() {
    const busdDecimals = await this.busdContract.read.decimals();
    const wbtcDecimals = await this.wbtcContract.read.decimals();
    const [reserve1, reserve2] = await this.pairContract.read.getReserves();
    const busdBalance = await this.busdContract.read.balanceOf([this.props.address]);
    const wbtcBalance = await this.wbtcContract.read.balanceOf([this.props.address]);
    const wbtcAllowance = await this.wbtcContract.read.allowance([this.props.address, routerContract.contract])
    const busdAllowance = await this.busdContract.read.allowance([this.props.address, routerContract.contract]);
    this.wbtc.decimals = wbtcDecimals;
    this.wbtc.reserve = reserve2;
    this.wbtc.balance = wbtcBalance;
    this.wbtc.allowance = wbtcAllowance;
    this.busd.decimals = busdDecimals;
    this.busd.reserve = reserve1;
    this.busd.balance = busdBalance;
    this.busd.allowance = busdAllowance;
  }

  render() {
    const onMax = async () => {
      await this.onCurrencyInChange(formatUnits(this.state.currencyIn.balance, this.state.currencyIn.decimals));
    }
    const onSwap = async (event: any) => {
      event.preventDefault();
      const date = new Date();
      const deadline = Math.floor(new Date(date.setMinutes(date.getMinutes() + 5)).getTime() / 1000);
      const amountOut = parseUnits(this.state.currencyOut.amount, this.state.currencyOut.decimals);
      const amountIn = parseUnits(this.state.currencyIn.amount, this.state.currencyIn.decimals);
      if(amountIn <= 0 || amountOut <= 0){
        this.setState({error: "You must input a valid amount"});
        return;
      }
      if (this.state.currencyIn.allowance < amountIn) {
        await this.state.currencyIn.contract.write.approve([routerContract.contract, this.MAX_ALLOWANCE]);
      }
      let transaction;
      if (this.activeCurrency === 'currencyIn') {
        transaction = await this.routerContract.write.swapExactTokensForTokens([
          amountIn,
          amountOut,
          [this.state.currencyIn.address, this.state.currencyOut.address],
          this.props.address,
          deadline
        ]);
      } else {
        transaction = await this.routerContract.write.swapTokensForExactTokens([
          amountOut,
          amountIn,
          [this.state.currencyIn.address, this.state.currencyOut.address],
          this.props.address,
          deadline
        ]);
      }
      await this.props.publicClient.waitForTransactionReceipt({hash: transaction})
      await this.refreshCurrencies();
    }

    const onSwitchDisplay = async () => {
      await this.refreshCurrencies();
      this.setState({currencyIn: this.state.currencyOut, currencyOut: this.state.currencyIn})
    }

    return (
      <>
        <FormControl>
          <InputLabel htmlFor={'in'}>{this.state.currencyIn.name}</InputLabel>
          <Input id='in' value={this.state.currencyIn.amount}
                 endAdornment={
                   <InputAdornment position="end"><Button onClick={onMax}>max</Button></InputAdornment>}
                 onChange={(event) => this.onCurrencyInChange(event.target.value)}/>
          <IconButton onClick={onSwitchDisplay}>
            <Loop/>
          </IconButton>
          <TextField label={this.state.currencyOut.name} value={this.state.currencyOut.amount}
                     onChange={(event) => this.onCurrencyOutChange(event.target.value)}></TextField>
          <Button onClick={onSwap}>Swap</Button>
        </FormControl>
        {this.state.error && <Alert severity="error">{this.state.error}</Alert>}
      </>
    );
  }

  private async onCurrencyInChange(value: string) {
    this.activeCurrency = 'currencyIn';
    const amountIn = parseUnits(value, this.state.currencyIn.decimals);
    const numerator = amountIn * BigInt(997) * this.state.currencyOut.reserve;
    const denominator = (this.state.currencyIn.reserve * BigInt(1000)) + (amountIn * BigInt(997));
    const amountOut = numerator / denominator;
    const currencyIn = this.state.currencyIn;
    currencyIn.amount = value;
    const currencyOut = this.state.currencyOut;
    currencyOut.amount = formatUnits(amountOut, this.state.currencyOut.decimals);
    if (amountIn > this.state.currencyIn.balance) {
      this.setState({error: "You don't have enough tokens"});
      currencyOut.amount = '';
    }
    this.setState({
      currencyIn,
      currencyOut
    });
  }

  async onCurrencyOutChange(value: string) {
    this.activeCurrency = 'currencyOut';
    const amountOut = parseUnits(value, this.state.currencyOut.decimals);
    const numerator = this.state.currencyIn.reserve * amountOut * BigInt(1000);
    const denominator = (this.state.currencyOut.reserve - amountOut) * BigInt(997);
    const amountIn = (numerator / denominator) + BigInt(1);
    const currencyIn = this.state.currencyIn;
    currencyIn.amount = formatUnits(amountIn, this.state.currencyIn.decimals);
    const currencyOut = this.state.currencyOut;
    currencyOut.amount = value;
    if (amountOut > this.state.currencyOut.reserve) {
      this.setState({error: "You're trying to swap an amount bigger than the reserve"});
      currencyIn.amount = '';
    }
    this.setState({
      currencyIn,
      currencyOut
    });
  }
}