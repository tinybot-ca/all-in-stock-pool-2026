import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ListOrdered,
  Trophy,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import playersData from '@/data/players.json';
import { PlayersData } from '@/lib/types';

export default function RulesPage() {
  const data = playersData as PlayersData;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Contest Rules</h1>
        <p className="text-muted-foreground">
          All-In Stock Draft 2026 Official Rules
        </p>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">10</p>
            <p className="text-sm text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <ListOrdered className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">100</p>
            <p className="text-sm text-muted-foreground">Stocks Drafted</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">${data.contestInfo.prizeAmount}</p>
            <p className="text-sm text-muted-foreground">Grand Prize</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">332</p>
            <p className="text-sm text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Pool of 240 Stocks</h3>
                <p className="text-muted-foreground">
                  All stocks must have a minimum $5B market cap and be US common stocks only.
                  The pool spans Technology, Semiconductors, Healthcare, Financials, Consumer,
                  Industrials, Energy, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Submit Your Ranked List</h3>
                <p className="text-muted-foreground">
                  Each player submits a ranked list of 30 stocks (1 = most wanted). This gives
                  you buffer in case your top picks are taken. Strategy tip: Mix popular picks
                  with sleepers!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Snake Draft Format</h3>
                <p className="text-muted-foreground">
                  The commissioner runs a snake draft. Round 1 picks 1→10, Round 2 picks 10→1,
                  Round 3 picks 1→10, and so on. When it's your turn, you get your highest-ranked
                  stock that hasn't been taken yet.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">No Overlaps</h3>
                <p className="text-muted-foreground">
                  Once a stock is picked, it's off the board. Every portfolio is 100% unique!
                  Each player ends up with exactly 10 stocks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold">Scoring</h3>
                <p className="text-muted-foreground">
                  Your score is the average percentage return of your 10 stocks from the base
                  price date to the end date. Highest total return wins the $1,000 grand prize!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Base Price Date</p>
                <p className="text-sm text-muted-foreground">Closing prices used as starting point</p>
              </div>
              <Badge>January 26, 2026</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Contest Start</p>
                <p className="text-sm text-muted-foreground">Tracking begins</p>
              </div>
              <Badge>January 27, 2026</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/20 rounded-lg">
              <div>
                <p className="font-medium">Contest End</p>
                <p className="text-sm text-muted-foreground">Last 4pm close before Christmas</p>
              </div>
              <Badge variant="default">December 24, 2026</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snake Draft Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Snake Draft Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="font-mono text-sm space-y-1">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20">Round 1:</span>
                <span>1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20">Round 2:</span>
                <span>10 → 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20">Round 3:</span>
                <span>1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10</span>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span className="w-20">...</span>
                <span>and so on for 10 rounds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiebreaker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Tiebreaker Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If two players rank the same stock at the same position on their lists, the player
            with the <strong>later draft position</strong> wins the tie. This helps balance the
            natural advantage of picking earlier in the snake draft.
          </p>
        </CardContent>
      </Card>

      {/* Prize */}
      <Card className="bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Grand Prize
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-yellow-500">${data.contestInfo.prizeAmount}</p>
            <p className="text-muted-foreground mt-2">Winner Take All</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No fees. No splits. One champion.</span>
          </div>
        </CardContent>
      </Card>

      {/* Why 30 Stocks? */}
      <Card>
        <CardHeader>
          <CardTitle>Why Submit 30 Stocks?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            In worst case, 9 players pick before you each round. Over 10 rounds, up to 90 stocks
            could be taken before all your picks. 30 stocks ensures you always have valid options.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Mix popular picks (likely to be contested) with sleepers (stocks others might overlook).
              Your sleeper in the #20 slot might become your best performer!
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
