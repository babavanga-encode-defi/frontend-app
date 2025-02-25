// Add size limit for stored markets (e.g., keep only last 50 markets)
const MAX_STORED_MARKETS = 50;

// Create a new utility file for storage management
export const storageManager = {
  // Maximum number of markets to keep in storage
  MAX_MARKETS: 50,

  cleanupStorage() {
    try {
      const markets = JSON.parse(localStorage.getItem('markets') || '[]');
      
      // Sort by date and keep only the latest MAX_MARKETS items
      const sortedMarkets = markets
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, this.MAX_MARKETS);
      
      // Clear storage and save only the latest markets
      localStorage.clear();
      localStorage.setItem('markets', JSON.stringify(sortedMarkets));
    } catch (error) {
      console.error('Storage cleanup failed:', error);
      // If all else fails, clear everything
      localStorage.clear();
    }
  },

  safeSetItem: (key: string, value: any) => {
    try {
      // If storing markets, implement cleanup
      if (key === 'markets') {
        const marketsArray = Array.isArray(value) ? value : [];
        
        // Keep only the most recent MAX_STORED_MARKETS
        const trimmedMarkets = marketsArray.slice(-MAX_STORED_MARKETS);
        
        localStorage.setItem(key, JSON.stringify(trimmedMarkets));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error: any) {
      // If quota exceeded, clear old data and try again
      if (error?.name === 'QuotaExceededError') {
        try {
          // Clear old markets data
          localStorage.removeItem('markets');
          // Try setting item again
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Storage retry failed:', retryError);
          // If still fails, at least preserve the newest market
          if (key === 'markets' && Array.isArray(value) && value.length > 0) {
            try {
              localStorage.setItem(key, JSON.stringify([value[value.length - 1]]));
            } catch (finalError) {
              console.error('Final storage attempt failed:', finalError);
            }
          }
        }
      } else {
        console.error('Storage error:', error);
      }
    }
  }
}; 