export interface PayerTransaction {
  payer: string;
  points: number;
  timestamp: Date;
}

export interface PayerDetailedTransaction extends PayerTransaction {
  payerId: string;
  time: number;
}

export interface SpendPoint {
  payer?: string;
  points: number;
}

export interface SpendPointRes {
  isError: boolean;
  detail: Array<SpendPoint | null>;
  message: string;
}

export interface PayerBalance {
  [key: string]: number;
}
