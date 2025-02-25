export interface MarketData {
  id: string;
  title: string;
  description: string;
  liquidity: string;
  endDate: string;
  endTime: string;
  tags: string[];
  yesTxid: string;
  noTxid: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface Market {
  id: number;
  title: string;
  distribution: { yes: number; no: number };
  liquidity: string;
  yesTxId?: string;
  noTxId?: string;
  isPending: boolean;
  imageUrl?: string | null;
} 