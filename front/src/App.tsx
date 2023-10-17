import {useState} from 'react';
import './App.css';
import WalletConnect from './wallet/WalletConnect';
import WalletDashboard from './wallet/WalletDashboard';
import {Address} from 'viem';


export function App() {
  const [contract, setContract] = useState<any>();
  const [publicClient, setPublicClient] = useState<any>();
  const [walletClient, setWalletClient] = useState<any>();
  const [address, setAddress] = useState<Address | undefined>(undefined);
  return (
    <div className="App">
      <WalletDashboard address={address} contract={contract} wallectClient={walletClient}
                       publicClient={publicClient}></WalletDashboard>
      <WalletConnect setAddress={setAddress} setContract={setContract} setWalletClient={setWalletClient}
                     setPublicClient={setPublicClient}></WalletConnect>
    </div>
  );
}

export default App;
