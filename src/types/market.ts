export interface MarketData {
  id: string | number;
  title: string;
  imageUrl?: string;
  liquidity?: string;
  endDate?: string;
  endTime?: string;
  description?: string;
  yesTxid?: string;
  noTxid?: string;
}

export interface Market {
  id: number | string;
  title: string;
  distribution: {
    yes: number;
    no: number;
  };
  liquidity: string;
  yesTxId?: string;
  noTxId?: string;
  isPending: boolean;
  createdAt: string;
  imageUrl?: string;
} 