import { Account } from "@glittr-sdk/sdk";

export interface LaserEyesContextType {
  paymentAddress: string;
  connected: boolean;
  signPsbt: (psbtHex: string, finalize: boolean, extractTx: boolean) => Promise<{ signedPsbtHex: string } | undefined>;
  paymentPublicKey: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

declare module "@glittr-sdk/lasereyes" {
  export interface LaserEyesContextType {
    connected: boolean;
    paymentAddress: string;
    paymentPublicKey: string;
    signPsbt: (psbtHex: string, finalize?: boolean, broadcast?: boolean) => Promise<{ signedPsbtHex?: string } | undefined>;
    connect: (wallet: ProviderType) => Promise<void>;
    disconnect: () => Promise<void>;
  }

  export function useLaserEyes(): LaserEyesContextType;
  
  export const UNISAT: string;
  export const LEATHER: string;
  export const XVERSE: string;
  export const ORANGE: string;
  export const GLITTR: string;
  export const GLITTR_DEVNET: string;
  export type ProviderType = string;
} 