import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';

// Storage error types
export class StorageError extends Error {
  constructor(
    message: string,
    public operation: 'read' | 'write' | 'remove',
    public key?: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Storage quota exceeded error
export class StorageQuotaError extends StorageError {
  constructor(key?: string) {
    super('Storage quota exceeded', 'write', key);
    this.name = 'StorageQuotaError';
  }
}

// Type-safe storage interface
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Configuration options
interface UseLocalStorageOptions<T> {
  serializer?: {
    parse: (value: string) => T;
    stringify: (value: T) => string;
  };
  onError?: (error: StorageError) => void;
  storage?: StorageInterface;
  syncAcrossTabs?: boolean;
  secure?: boolean; // delegate to secureStorage
  encrypt?: boolean; // encryption flag when using secureStorage
  namespace?: string; // namespace for secure keys
}

// Default serializer with enhanced error handling
const defaultSerializer = {
  parse: <T>(value: string): T => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new StorageError(
        `Failed to parse stored value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'read'
      );
    }
  },
  stringify: <T>(value: T): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new StorageError(
        `Failed to serialize value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'write'
      );
    }
  },
};

// Check if storage is available
const isStorageAvailable = (storage: StorageInterface): boolean => {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Enhanced useLocalStorage hook with TypeScript support
function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const {
    serializer = defaultSerializer,
    onError = error => console.error('Storage error:', error),
    storage = window.localStorage,
    syncAcrossTabs = false,
    secure = false,
    encrypt = false,
    namespace,
  } = options;

  // Initialize state with type safety
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if storage is available
      if (!isStorageAvailable(storage)) {
        throw new StorageError('Storage is not available', 'read', key);
      }

      if (secure) {
        const secureVal = secureStorage.get<T>(key, { encrypt, namespace });
        if (secureVal != null) return secureVal;
      }
      const item = secure ? null : storage.getItem(key);
      if (item === null) return initialValue;
      return serializer.parse(item);
    } catch (error) {
      const storageError =
        error instanceof StorageError
          ? error
          : new StorageError(`Failed to read from storage: ${error}`, 'read', key);
      onError(storageError);
      return initialValue;
    }
  });

  // Enhanced setValue function with error handling and validation
  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Validate the value before storing
        if (valueToStore === undefined) {
          throw new StorageError('Cannot store undefined value', 'write', key);
        }

        setStoredValue(valueToStore);

        if (secure) {
          const result = secureStorage.set(key, valueToStore as unknown as unknown, {
            encrypt,
            namespace,
          });
          if (!result.success) {
            if (result.error === 'VALUE_TOO_LARGE' || /quota/i.test(result.error || '')) {
              throw new StorageQuotaError(key);
            }
            throw new StorageError(`Secure storage write failed: ${result.error}`, 'write', key);
          }
          return;
        }
        if (!isStorageAvailable(storage))
          throw new StorageError('Storage is not available', 'write', key);
        const serializedValue = serializer.stringify(valueToStore);
        if (serializedValue.length > 5242880) throw new StorageQuotaError(key);
        storage.setItem(key, serializedValue);
      } catch (error) {
        let storageError: StorageError;

        if (error instanceof StorageError) {
          storageError = error;
        } else if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          storageError = new StorageQuotaError(key);
        } else {
          storageError = new StorageError(
            `Failed to write to storage: ${error instanceof Error ? error.message : error}`,
            'write',
            key
          );
        }

        onError(storageError);
      }
    },
    [key, storedValue, storage, serializer, onError, secure, encrypt, namespace]
  );

  // Remove value function
  const removeValue = useCallback(() => {
    try {
      if (secure) {
        secureStorage.remove(key, { namespace });
      } else {
        if (!isStorageAvailable(storage))
          throw new StorageError('Storage is not available', 'remove', key);
        storage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      const storageError =
        error instanceof StorageError
          ? error
          : new StorageError(`Failed to remove from storage: ${error}`, 'remove', key);
      onError(storageError);
    }
  }, [key, initialValue, storage, onError, secure, namespace]);

  // Listen for storage changes across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          const storageError = new StorageError(
            `Failed to sync storage change: ${error}`,
            'read',
            key
          );
          onError(storageError);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, serializer, onError, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
