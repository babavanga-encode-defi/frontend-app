export interface Account {
  p2wpkh: () => { address: string };
  network: string;
  p2pkh: () => { address: string };
  p2tr: () => { address: string };
  publicKey: string;
  keypair: any; // Required by SDK
} 