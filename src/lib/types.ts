export interface Stock {
  ticker: string;
  basePrice: number;
}

export interface Player {
  id: string;
  name: string;
  draftPosition: number;
  stocks: Stock[];
}

export interface ContestInfo {
  name: string;
  startDate: string;
  endDate: string;
  prizeAmount: number;
  basePriceDate: string;
  scoring: string;
}

export interface PlayersData {
  contestInfo: ContestInfo;
  players: Player[];
}

export interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

export interface CurrentPrices {
  lastUpdated: string;
  prices: Record<string, number>;
}

export interface PlayerStanding {
  rank: number;
  previousRank?: number;
  player: Player;
  totalReturn: number;
  stockReturns: {
    ticker: string;
    basePrice: number;
    currentPrice: number;
    return: number;
  }[];
  bestStock: { ticker: string; return: number };
  worstStock: { ticker: string; return: number };
}

export interface HistoricalDataPoint {
  date: string;
  returns: Record<string, number>;
}
