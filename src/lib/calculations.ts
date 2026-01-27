import { Player, PlayerStanding, CurrentPrices } from './types';

export function calculateStockReturn(basePrice: number, currentPrice: number): number {
  return (currentPrice - basePrice) / basePrice;
}

export function calculatePlayerStandings(
  players: Player[],
  currentPrices: CurrentPrices,
  previousRanks?: Record<string, number>
): PlayerStanding[] {
  const standings: PlayerStanding[] = players.map((player) => {
    const stockReturns = player.stocks.map((stock) => {
      const currentPrice = currentPrices.prices[stock.ticker] || stock.basePrice;
      const returnPct = calculateStockReturn(stock.basePrice, currentPrice);
      return {
        ticker: stock.ticker,
        basePrice: stock.basePrice,
        currentPrice,
        return: returnPct,
      };
    });

    const totalReturn = stockReturns.reduce((sum, s) => sum + s.return, 0) / stockReturns.length;

    const sortedByReturn = [...stockReturns].sort((a, b) => b.return - a.return);
    const bestStock = { ticker: sortedByReturn[0].ticker, return: sortedByReturn[0].return };
    const worstStock = {
      ticker: sortedByReturn[sortedByReturn.length - 1].ticker,
      return: sortedByReturn[sortedByReturn.length - 1].return,
    };

    return {
      rank: 0,
      previousRank: previousRanks?.[player.id],
      player,
      totalReturn,
      stockReturns,
      bestStock,
      worstStock,
    };
  });

  // Sort by total return (highest first)
  standings.sort((a, b) => b.totalReturn - a.totalReturn);

  // Assign ranks
  standings.forEach((standing, index) => {
    standing.rank = index + 1;
  });

  return standings;
}

export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getRankChangeIcon(current: number, previous?: number): string {
  if (previous === undefined) return '';
  if (current < previous) return '↑';
  if (current > previous) return '↓';
  return '–';
}

export function getRankChangeClass(current: number, previous?: number): string {
  if (previous === undefined) return '';
  if (current < previous) return 'text-green-500';
  if (current > previous) return 'text-red-500';
  return 'text-gray-400';
}
