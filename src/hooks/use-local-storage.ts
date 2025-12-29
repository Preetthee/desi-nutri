
'use client';

import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  try {
    // Return defaultValue if saved is null or 'undefined'
    if (saved === null || saved === 'undefined') {
        return defaultValue;
    }
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  // This effect runs once on mount to get the value from localStorage.
  useEffect(() => {
    setValue(getStorageValue(key, defaultValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  const setStoredValue = useCallback((newValue: T | ((prevState: T) => T)) => {
      try {
          const valueToStore = newValue instanceof Function ? newValue(getStorageValue(key, defaultValue)) : newValue;
          setValue(valueToStore);
          if (typeof window !== 'undefined') {
              localStorage.setItem(key, JSON.stringify(valueToStore));
               // Manually dispatch a storage event to sync tabs
              window.dispatchEvent(new StorageEvent('storage', {
                  key: key,
                  newValue: JSON.stringify(valueToStore),
              }));
          }
      } catch (error) {
          console.error(`Error setting localStorage key “${key}”:`, error);
      }
  }, [key, defaultValue]);


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event value for key “${key}”:`, error);
        }
      } else if (e.key === key && e.newValue === null) {
          // Handle item removal
          setValue(defaultValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [value, setStoredValue as React.Dispatch<React.SetStateAction<T>>];
}
