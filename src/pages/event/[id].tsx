import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MarketData } from '../../types/market';
import { useLaserEyes } from '@glittr-sdk/lasereyes';

export default function EventPage() {
  const { id } = useParams();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [selectedTab, setSelectedTab] = useState('orderbook');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<string>('0');
  const [percentage, setPercentage] = useState<25 | 50 | 75 | 100 | null>(null);
  const { connected, paymentAddress } = useLaserEyes();
  const [walletBalance, setWalletBalance] = useState(0);

  // Update the balance calculation with current BTC price (approximately $63,000 as of now)
  const BTC_PRICE = 63000;

  useEffect(() => {
    // Get market data from localStorage
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const marketData = markets.find((m: MarketData) => m.id === id);
    if (marketData) {
      setMarket(marketData);
      console.log("Found market data:", marketData);
    } else {
      console.log("Market not found for ID:", id);
    }
  }, [id]);

  // Add this effect to fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && paymentAddress) {
        try {
          // For now, let's use the hardcoded BTC amount
          const btcBalance = 0.09922140;
          const balanceInUSD = btcBalance * BTC_PRICE;
          setWalletBalance(balanceInUSD);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setWalletBalance(0);
        }
      }
    };

    fetchBalance();
  }, [connected, paymentAddress]);

  // Add these functions to handle amount changes
  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    setAmount(cleanValue);
  };

  const incrementAmount = () => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + 1).toString());
  };

  const decrementAmount = () => {
    const currentAmount = parseFloat(amount) || 0;
    if (currentAmount > 0) {
      setAmount((currentAmount - 1).toString());
    }
  };

  // Add this function to handle percentage clicks
  const handlePercentageClick = (percent: 25 | 50 | 75 | 100) => {
    setPercentage(percent);
    const newAmount = (walletBalance * (percent / 100)).toFixed(2);
    setAmount(newAmount);
  };

  // Add these calculations
  const calculateTradeDetails = (amount: string) => {
    const inputAmount = parseFloat(amount) || 0;
    const selectedPrice = selectedOutcome === 'yes' ? 1.1 : 0.2;
    
    const quantity = inputAmount / selectedPrice;
    const totalPut = inputAmount;
    const potentialReturns = quantity * 1; // Assuming $1 per share if won
    const returnPercentage = ((potentialReturns - totalPut) / totalPut * 100) || 0;

    return {
      quantity: quantity.toFixed(1),
      totalPut: `$${totalPut.toFixed(2)} (+${(totalPut * 0.01).toFixed(2)}¢)`,
      potentialReturns: `$${potentialReturns.toFixed(2)} (${returnPercentage.toFixed(2)}%)`
    };
  };

  // Update where we display the trade details
  const tradeDetails = calculateTradeDetails(amount);

  if (!market) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <Link 
            to="/"
            className="text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="pt-24 px-8 max-w-[1440px] mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </Link>

        <div className="grid grid-cols-[1fr_400px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Market Info */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-[#1a1a1a] rounded-lg overflow-hidden">
                {market.imageUrl ? (
                  <img src={market.imageUrl} alt={market.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-white/30">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{market.title}</h1>
                <div className="flex items-center gap-6 text-white/50">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20"/>
                    </svg>
                    <span>${market.liquidity} Vol.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{market.endDate} {market.endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Tabs */}
            <div className="border-b border-[#1a1a1a]">
              <div className="flex gap-8">
                <button
                  onClick={() => setSelectedTab('orderbook')}
                  className={`pb-4 text-lg font-bold transition-colors ${
                    selectedTab === 'orderbook' 
                      ? 'text-[#DB9AFF] border-b-2 border-[#DB9AFF]' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Orderbook
                </button>
                <button
                  onClick={() => setSelectedTab('about')}
                  className={`pb-4 text-lg font-bold transition-colors ${
                    selectedTab === 'about' 
                      ? 'text-[#DB9AFF] border-b-2 border-[#DB9AFF]' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  About This Event
                </button>
              </div>
            </div>

            {/* Content based on selected tab */}
            {selectedTab === 'orderbook' ? (
              <div className="space-y-6">
                {/* Chart */}
                <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">YES</span>
                      <span className="text-white/50">50% chance</span>
                    </div>
                    <div className="flex gap-2">
                      {['1M', '1W', '1D', '4H', '1H'].map(timeframe => (
                        <button
                          key={timeframe}
                          onClick={() => setSelectedTimeframe(timeframe)}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedTimeframe === timeframe
                              ? 'bg-[#1a1a1a] text-white'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {timeframe}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px] flex items-center justify-center text-white/30">
                    Chart will be implemented here
                  </div>
                </div>

                {/* Market Summary */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Market Summary</h2>
                    <button className="px-6 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#1a1a1a]/60 transition-colors">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-white/70">{market.description || "No description provided"}</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
                  <div className="space-y-2">
                    <a 
                      href={`https://explorer.glittr.fi/tx/${market.yesTxid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors"
                    >
                      YES Contract →
                    </a>
                    <a 
                      href={`https://explorer.glittr.fi/tx/${market.noTxid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors"
                    >
                      NO Contract →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg p-6">
              

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setSelectedAction('buy')}
                  className={`flex-1 py-2 rounded-lg text-lg font-bold transition-colors ${
                    selectedAction === 'buy'
                      ? 'bg-[#1a1a1a] text-[#DB9AFF]'
                      : 'text-white/50 hover:text-white hover:bg-[#1a1a1a]/60'
                  }`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setSelectedAction('sell')}
                  className={`flex-1 py-2 rounded-lg text-lg font-bold transition-colors ${
                    selectedAction === 'sell'
                      ? 'bg-[#1a1a1a] text-[#DB9AFF]'
                      : 'text-white/50 hover:text-white hover:bg-[#1a1a1a]/60'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50">Outcome</span>
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.3-4.3"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedOutcome('yes')}
                      className={`py-2 rounded-lg text-sm font-bold bg-[#1a1a1a] transition-colors ${
                        selectedOutcome === 'yes'
                          ? 'text-[#DB9AFF]'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Yes $0.5
                    </button>
                    <button 
                      onClick={() => setSelectedOutcome('no')}
                      className={`py-2 rounded-lg text-sm font-bold bg-[#1a1a1a] transition-colors ${
                        selectedOutcome === 'no'
                          ? 'text-[#DB9AFF]'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      No $0.5
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50">Amount</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full py-2 pl-[4.5rem] pr-12 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-[#DB9AFF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-left"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                    <button 
                      onClick={decrementAmount}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14"/>
                      </svg>
                    </button>
                    <span className="absolute left-[3.5rem] top-1/2 -translate-y-1/2 text-white/50">$</span>
                    <button 
                      onClick={incrementAmount}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/50">Total Balance:</span>
                  <span className="text-white">${walletBalance.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => handlePercentageClick(percent as 25 | 50 | 75 | 100)}
                      className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
                        percentage === percent
                          ? 'bg-[#1a1a1a] text-[#DB9AFF] border border-[#DB9AFF]'
                          : 'bg-[#1a1a1a] text-white/50 hover:text-white border border-[#1a1a1a]'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Quantity</span>
                    <span className="text-[#DB9AFF]">{tradeDetails.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Total (You put)</span>
                    <span className="text-[#DB9AFF]">{tradeDetails.totalPut}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Potential Returns (You get)</span>
                    <span className="text-[#DB9AFF]">{tradeDetails.potentialReturns}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    className="w-full bg-[rgb(186,154,238)] text-white text-lg font-bold py-3 rounded-lg shadow-[inset_0_0_150px_4px_rgba(88,45,155,1)] hover:shadow-[inset_0_0_200px_8px_rgba(88,45,155,1)] transition-shadow duration-200"
                  >
                    {connected ? selectedAction === 'buy' ? 'Buy' : 'Sell' : 'Connect Wallet'}
                  </button>
                  <p className="text-center text-xs text-white/30 mt-2">
                    By trading, you agree to <a href="#" className="text-white/50 hover:text-white">Terms of Use</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 