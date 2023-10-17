import {connectPublicClient, connectWalletClient} from "./wallet";
import {polygonMumbai} from "viem/chains";
import {Component} from "react";
import {Address, getContract} from "viem";
import {busdContract} from "../contracts/busd-contract";

export default class WalletConnect extends Component<{
  setContract: (contract: any) => void;
  setWalletClient: (contract: any) => void;
  setPublicClient: (contract: any) => void;
  setAddress: (contract: any) => void;
}> {
  private readonly REFRESH_TIMER = 60000;

  private connected = false;
  private walletClient: any;
  private publicClient: any;
  private refreshInterval: any;
  private switchingChain = false;

  constructor(props: {
    setContract: (contract: any) => void;
    setWalletClient: (contract: any) => void;
    setPublicClient: (contract: any) => void;
    setAddress: (contract: any) => void;
  }) {
    super(props);
    this.handleConnect = this.handleConnect.bind(this);
  }

  render() {
    if (!this.connected) {
      return (
        <>
          <button
            onClick={this.handleConnect}
          >
            Connect wallet
          </button>
        </>);
    }
  }

  private async handleConnect() {
    this.walletClient = await connectWalletClient();
    this.props.setWalletClient(this.walletClient)
    this.publicClient = await connectPublicClient();
    this.props.setPublicClient(this.publicClient)
    this.props.setContract((getContract as any)({
      address: busdContract.contract as Address,
      abi: busdContract.abi,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    }));
    await this.refreshWallet();
    this.refreshInterval = setInterval(async () => await this.refreshWallet(), 500);
  }

  private async refreshWallet() {
    if ((await this.walletClient.getChainId()) !== polygonMumbai.id && !this.switchingChain) {
      this.switchingChain = true;
      await this.walletClient.switchChain(polygonMumbai);
    }

    if ((await this.walletClient.getChainId()) === polygonMumbai.id) {
      this.switchingChain = false;
    } else {
      this.props.setAddress(undefined);
      return;
    }
    const [address] = await this.walletClient.requestAddresses();
    this.connected = true;
    this.props.setAddress(address);
  }
}