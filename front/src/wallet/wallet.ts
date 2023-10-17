import {Address, createPublicClient, createWalletClient, custom, getContract} from "viem";
import {polygonMumbai} from "viem/chains";
import "viem/window";
import {pairContract} from "../contracts/pair-contract";
import {wbtcContract} from "../contracts/wbtc-contract";
import {routerContract} from "../contracts/router-contract";

export async function connectWalletClient() {
  if (window.ethereum) {
    const [account] = await window.ethereum.request({method: 'eth_requestAccounts'})
    return createWalletClient({
      account,
      chain: polygonMumbai,
      transport: custom(window.ethereum)
    });
  } else {
    throw new Error('ethereum not found');
  }
}


export function connectPublicClient() {
  if (window.ethereum) {
    return createPublicClient({
      chain: polygonMumbai,
      transport: custom(window.ethereum)
    });
  } else {
    throw new Error('ethereum not found');
  }
}


export function createPairContract(walletClient: any,publicClient: any) {
  return (getContract as any)({
    address: pairContract.contract as Address,
    abi: pairContract.abi,
    publicClient,
    walletClient,
  });
}

export function createWbtcContract(walletClient: any,publicClient: any) {
  return (getContract as any)({
    address: wbtcContract.contract as Address,
    abi: wbtcContract.abi,
    publicClient,
    walletClient,
  });
}

export function createRouterContract(walletClient: any, publicClient: any) {
  return (getContract as any)({
    address: routerContract.contract as Address,
    abi: routerContract.abi,
    publicClient,
    walletClient,
  });
}
