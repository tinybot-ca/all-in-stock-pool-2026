import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import stockPool from '@/data/stockPool.json';
import { PlayersData, CurrentPrices } from '@/lib/types';
import { LivePlayerContent } from './LivePlayerContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = playersData as PlayersData;
  return data.players.map((player) => ({
    slug: player.id,
  }));
}

export default async function PlayerPage({ params }: PageProps) {
  const { slug } = await params;
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;

  const player = data.players.find((p) => p.id === slug);
  if (!player) {
    notFound();
  }

  // Get stock info for sector breakdown
  const stockInfo = stockPool.stocks.reduce(
    (acc, stock) => {
      acc[stock.ticker] = stock;
      return acc;
    },
    {} as Record<string, { ticker: string; name: string; sector: string; size: string }>
  );

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leaderboard
        </Button>
      </Link>

      <LivePlayerContent
        player={player}
        allPlayers={data.players}
        staticPrices={prices}
        stockInfo={stockInfo}
      />
    </main>
  );
}
