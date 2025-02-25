import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Create from './pages/create';
import EventPage from './pages/event/[id]';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Define Market interface
interface Market {
  id: number;
  title: string;
  distribution: { yes: number; no: number };
  liquidity: string;
  yesTxId?: string;
  noTxId?: string;
  isPending: boolean;
  createdAt: string;
}

// Initial markets data
const initialMarkets: Market[] = [
  {
    id: 1,
    title: "Will AfD win more than 30% seats in German Parliamenta...",
    distribution: { yes: 50, no: 50 },
    liquidity: "$50,000",
    isPending: false,
    createdAt: "2024-01-01T12:00:00"
  },
  {
    id: 2,
    title: "Newcastle United to win against Nottingham Forest?",
    distribution: { yes: 50, no: 50 },
    liquidity: "$25,000",
    isPending: false,
    createdAt: "2024-01-02T12:00:00"
  },
  {
    id: 3,
    title: "Real Madrid to win against Girona FC?",
    distribution: { yes: 50, no: 50 },
    liquidity: "$75,000",
    isPending: false,
    createdAt: "2024-01-03T12:00:00"
  },
  {
    id: 4,
    title: "Will Bitcoin reach $100k by end of 2024?",
    distribution: { yes: 50, no: 50 },
    liquidity: "$100,000",
    isPending: false,
    createdAt: "2024-01-04T12:00:00"
  }
];

// Add these types at the top
type SortOption = 'recent' | 'liquidity' | 'none';

// First, add this type for filtered markets
type FilteredMarket = Market & { key: string };

function App() {
  // Load markets only once at start
  const [markets, setMarkets] = useState<Market[]>(() => {
    return initialMarkets; // Just use initial markets
  });

  // Single useEffect to check for new market titles
  useEffect(() => {
    const interval = setInterval(() => {
      const newTitle = localStorage.getItem('newMarketTitle');
      if (newTitle) {
        console.log('Adding new market:', newTitle);
        setMarkets(prev => [
          {
            id: Date.now(),
            title: newTitle,
            distribution: { yes: 50, no: 50 },
            liquidity: "$0",
            isPending: true,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        localStorage.removeItem('newMarketTitle');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const HomePage = () => {
    const [localMarkets, setLocalMarkets] = useState<Market[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('none');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Add filtered markets state
    const [filteredMarkets, setFilteredMarkets] = useState<FilteredMarket[]>([]);

    // Add click outside handler for dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isDropdownOpen && !(event.target as Element).closest('.sort-dropdown')) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    useEffect(() => {
      // Get markets from localStorage
      const storedMarkets = JSON.parse(localStorage.getItem('markets') || '[]');
      setLocalMarkets(storedMarkets);
      
      // Initialize filtered markets with keys
      setFilteredMarkets(storedMarkets.map((market: Market) => ({
        ...market,
        key: `${market.id}-${Date.now()}`
      })));
    }, []);

    // Update filtered markets when search or sort changes
    useEffect(() => {
      const filtered = localMarkets
        .filter(market => 
          market.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'recent') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (sortBy === 'liquidity') {
            return parseFloat(b.liquidity.replace(/[^0-9.-]+/g, "")) - 
                   parseFloat(a.liquidity.replace(/[^0-9.-]+/g, ""));
          }
          return 0;
        })
        .map(market => ({
          ...market,
          key: `${market.id}-${Date.now()}`
        }));

      setFilteredMarkets(filtered);
    }, [searchQuery, sortBy, localMarkets]);

    return (
      <div className="pt-24 px-8 max-w-[1440px] mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Binary Markets</h2>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <motion.div 
                className="relative"
                initial={false}
              >
                <motion.input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[240px] pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#DB9AFF] transition-all duration-300"
                  animate={{
                    width: searchQuery ? "300px" : "240px",
                    boxShadow: searchQuery ? "0 0 20px rgba(219, 154, 255, 0.1)" : "none"
                  }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              </motion.div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg text-sm text-white hover:border-[#DB9AFF]/50 transition-colors flex items-center gap-2"
                >
                  <span className="text-white/70">Sort by:</span> {sortBy === 'none' ? 'Default' : sortBy === 'recent' ? 'Recently Launched' : 'Highest Liquidity'}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-[#0A0A0A] border border-[#1a1a1a] shadow-lg z-50"
                    >
                      <div className="py-1">
                        {[
                          { value: 'none', label: 'Default' },
                          { value: 'recent', label: 'Recently Launched' },
                          { value: 'liquidity', label: 'Highest Liquidity' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as SortOption);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-[#1a1a1a] transition-colors ${
                              sortBy === option.value ? 'text-[#DB9AFF]' : 'text-white/70'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMarkets.map(market => (
                <motion.div
                  key={market.key}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    layout: { duration: 0.3 },
                    scale: { duration: 0.2 }
                  }}
                >
                  <Link 
                    to={`/event/${market.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg overflow-hidden hover:border-[#DB9AFF]/50 transition-colors duration-200"
                  >
                    <div className="h-48 bg-[#1a1a1a] flex items-center justify-center border-t border-l border-r border-[#1a1a1a] border-b-2">
                      {market.imageUrl ? (
                        <img 
                          src={market.imageUrl} 
                          alt={market.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#333333] text-sm">No Image</span>
                      )}
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
                      <div className="pt-4 border-t border-[#1a1a1a] text-sm text-white/50">
                        Liquidity Pool: ${market.liquidity}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<Create />} />
            <Route path="/event/:id" element={<EventPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App; 