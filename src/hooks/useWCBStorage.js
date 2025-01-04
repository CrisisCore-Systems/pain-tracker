import { useState, useEffect } from "react";

function useWCBStorage(key, initialValue) {
  // Initialize state with validation
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        // Validate data structure
        if (!Array.isArray(parsedItem)) {
          console.error("Invalid data structure detected");
          return initialValue;
        }
        return parsedItem;
      }
      return initialValue;
    } catch (error) {
      console.error("Storage initialization error:", error);
      return initialValue;
    }
  });

  // Auto-backup to localStorage with error handling
  useEffect(() => {
    try {
      // Create backup before saving
      const previousData = window.localStorage.getItem(key);
      if (previousData) {
        window.localStorage.setItem(`${key}_backup`, previousData);
      }

      // Save current data
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Storage save error:", error);
      // Attempt to restore from backup
      const backup = window.localStorage.getItem(`${key}_backup`);
      if (backup) {
        setStoredValue(JSON.parse(backup));
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useWCBStorage;
