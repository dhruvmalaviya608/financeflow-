'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type SettingsContextType = {
  isPasswordRequired: boolean;
  setIsPasswordRequired: (value: boolean) => void;
  isLoginEnabled: boolean;
  setIsLoginEnabled: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialState = (key: string, defaultValue: boolean) => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  }
  return defaultValue;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default to true on the server to prevent hydration issues
  const [isPasswordRequired, _setIsPasswordRequired] = useState(true);
  const [isLoginEnabled, _setIsLoginEnabled] = useState(true);

  useEffect(() => {
    // This effect runs once on the client to safely get the initial state from localStorage
    _setIsPasswordRequired(getInitialState('isPasswordRequired', true));
    _setIsLoginEnabled(getInitialState('isLoginEnabled', true));
  }, []);

  const setIsPasswordRequired = useCallback((value: boolean) => {
    _setIsPasswordRequired(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPasswordRequired', JSON.stringify(value));
    }
  }, []);

  const setIsLoginEnabled = useCallback((value: boolean) => {
    _setIsLoginEnabled(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoginEnabled', JSON.stringify(value));
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ isPasswordRequired, setIsPasswordRequired, isLoginEnabled, setIsLoginEnabled }}>
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
