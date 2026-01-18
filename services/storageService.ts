
export interface UserPreferences {
  selectedSymbol: string;
  chartTimeframe: string;
  watchedSymbols: string[];
  theme?: 'dark' | 'light';
  language?: 'en' | 'ar';
}

const STORAGE_KEY = 'g8_terminal_prefs_v1';

const DEFAULT_PREFS: UserPreferences = {
  selectedSymbol: 'BTC',
  chartTimeframe: '1H',
  watchedSymbols: ['BTC', 'ETH', 'SOL', 'LTC', 'BNB', 'AAVE', 'ADA', 'BCH', 'XRP'],
  theme: 'dark',
  language: 'en'
};

export const storageService = {
  // Load preferences from "Cloud" (Local Storage for now)
  loadPreferences: (): UserPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_PREFS;
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFS, ...parsed };
    } catch (error) {
      console.error("Failed to load preferences:", error);
      return DEFAULT_PREFS;
    }
  },

  // Save preferences
  savePreferences: (prefs: Partial<UserPreferences>) => {
    try {
      const current = storageService.loadPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // In a real app, this would also fire an API call to sync with backend
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  },

  // Clear preferences
  resetPreferences: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
