import { Account } from "@glittr-sdk/sdk";

interface LaserEyesContextType {
  paymentAddress: string;
  connected: boolean;
  signPsbt: (psbtHex: string, finalize?: boolean, broadcast?: boolean) => Promise<{ signedPsbtHex?: string } | undefined>;
  paymentPublicKey: string;
  account: Account | null;
} 