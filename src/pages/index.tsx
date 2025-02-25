"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';

// Define the Market type
interface Market {
  id: number;
  title: string;
  distribution: {
    yes: number;
    no: number;
  };
  liquidity: string;
  yesTxId?: string;
  noTxId?: string;
}

export default function Home() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const address = "3qF6BizBhFoAtuk7z5efDEugxpCV3yC6vFjt";

  // Sample data for binary markets
  const binaryMarkets = [
    {
      id: 1,
      title: "Will AfD win more than 30% seats in German Parliamenta...",
      distribution: { yes: 50, no: 50 },
      liquidity: "$50,000"
    },
    {
      id: 2,
      title: "Newcastle United to win against Nottingham Forest?",
      distribution: { yes: 50, no: 50 },
      liquidity: "$25,000"
    },
    {
      id: 3,
      title: "Real Madrid to win against Girona FC?",
      distribution: { yes: 50, no: 50 },
      liquidity: "$75,000"
    },
    {
      id: 4,
      title: "Will Bitcoin reach $100k by end of 2024?",
      distribution: { yes: 50, no: 50 },
      liquidity: "$100,000"
    }
  ];

  useEffect(() => {
    try {
      // Get user created markets from localStorage
      const userCreatedMarkets = JSON.parse(localStorage.getItem('binaryMarkets') || '[]');
      
      // Combine with dummy markets
      const combinedMarkets = [...userCreatedMarkets, ...binaryMarkets];
      setAllMarkets(combinedMarkets);
      
      console.log("Combined markets:", combinedMarkets); // Debug log
    } catch (error) {
      console.error("Error loading markets:", error);
      // Fallback to just dummy markets if there's an error
      setAllMarkets(binaryMarkets);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden pb-24">
      {/* Main Content */}
      <div className="pt-24 px-8 max-w-[1440px] mx-auto">
        {/* Binary Markets Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Binary Markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allMarkets.map(market => (
              <Link 
                key={market.id}
                href={`/event/${market.id}`}
                className="block bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg overflow-hidden hover:border-[#DB9AFF]/50 transition-colors duration-200"
              >
                <div className="h-48 bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-[#333333]">Placeholder Image</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6 h-[60px] line-clamp-2">
                    {market.title}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#DB9AFF]"
                        style={{ width: '50%' }}
                      />
                    </div>
                    <span className="text-sm text-white/50">50/50</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button className="p-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white/50 hover:text-white hover:bg-[#1a1a1a]/60 transition-colors">
                      Yes 50¢
                    </button>
                    <button className="p-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white/50 hover:text-white hover:bg-[#1a1a1a]/60 transition-colors">
                      No 50¢
                    </button>
                  </div>
                  {/* Show transaction links only for user-created markets */}
                  {market.yesTxId && market.noTxId && (
                    <div className="space-y-2 mb-4 text-xs text-white/50">
                      <a 
                        href={market.yesTxId} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block truncate hover:text-white/70"
                      >
                        YES Tx: {market.yesTxId}
                      </a>
                      <a 
                        href={market.noTxId} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block truncate hover:text-white/70"
                      >
                        NO Tx: {market.noTxId}
                      </a>
                    </div>
                  )}
                  <div className="pt-4 border-t border-[#1a1a1a] text-sm text-white/50">
                    Liquidity Pool: {market.liquidity}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="bg-[#0A0A0A] border-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Deposit on Base</DialogTitle>
          </DialogHeader>
          <Separator className="bg-[#1a1a1a]"/>
          <div className="flex flex-col items-center gap-4 py-1">
            <p className="text-center text-[#FFFFFF]">
              Send USDT to the Base address<br />
              below to start predicting!
            </p>
            <p className="text-center text-[#454746]">
              Note: Minimum 2 USDT
            </p>
            <div className="flex items-center gap-2 bg-[#1a1a1a] p-3 rounded-lg w-full">
              <p className="flex-1 text-sm truncate">{address}</p>
              <button 
                onClick={handleCopy}
                className="text-white hover:text-white/80 transition-colors min-w-[60px]"
              >
                {isCopied ? '✓' : 'Copy'}
              </button>
            </div>
            <button 
              className="w-full bg-[rgb(186,154,238)] text-white text-2xl font-bold py-2 rounded-lg shadow-[inset_0_0_150px_4px_rgba(88,45,155,1)] hover:shadow-[inset_0_0_200px_8px_rgba(88,45,155,1)] transition-shadow duration-200"
              onClick={() => setIsDepositOpen(false)}
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
} 