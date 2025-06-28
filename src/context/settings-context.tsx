'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type SettingsContextType = {
  isPasswordRequired: boolean;
  setIsPasswordRequired: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('isPasswordRequired');
    return storedValue !== null ? JSON.parse(storedValue) : true;
  }
  return true; // Default value for server-side rendering
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isPasswordRequired, _setIsPasswordRequired] = useState<boolean>(getInitialState);

  useEffect(() => {
    // Sync with localStorage on initial client load
    _setIsPasswordRequired(getInitialState());
  }, []);

  const setIsPasswordRequired = useCallback((value: boolean) => {
    _setIsPasswordRequired(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPasswordRequired', JSON.stringify(value));
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ isPasswordRequired, setIsPasswordRequired }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
