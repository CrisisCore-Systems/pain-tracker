import React, { useEffect, useRef, useState } from 'react';
import { useVault } from '../../hooks/useVault';

const MIN_PASSPHRASE_LENGTH = 12;

export interface VaultGateProps {
  children: React.ReactNode;
}

export const VaultGate: React.FC<VaultGateProps> = ({ children }) => {
  const { status, setupPassphrase, unlock, lock, clearAll } = useVault();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const passphraseInputRef = useRef<HTMLInputElement>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);

  useEffect(() => {
    if (status.state === 'uninitialized' || status.state === 'locked') {
      setTimeout(() => {
        passphraseInputRef.current?.focus();
      }, 50);
    }
  }, [status.state]);

  const resetForm = () => {
    setPassphrase('');
    setConfirmPassphrase('');
    setError(null);
  };

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isProcessing) return;

    if (passphrase !== confirmPassphrase) {
      setError('Passphrases must match.');
      return;
    }

    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters long.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      await setupPassphrase(passphrase);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initialize vault.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isProcessing) return;

    if (!passphrase) {
      setError('Please enter your secure passphrase.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      await unlock(passphrase);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock vault.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetVault = async () => {
    const confirmed = window.confirm(
      'Resetting the secure vault will permanently remove all locally stored entries and settings. This action cannot be undone. Do you want to continue?'
    );
    if (!confirmed) return;
    clearAll();
    lock();
    resetForm();
  };

  const renderSetup = () => (
    <form onSubmit={handleSetup} className="space-y-6" aria-labelledby="vault-setup-title">
      <div>
        <h2
          id="vault-setup-title"
          className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
        >
          Create a secure passphrase
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choose a gentle yet strong passphrase that you will remember. It protects your pain
          entries and personal notes on this device. For security, your passphrase is never stored
          anywhere.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block" htmlFor="vault-passphrase">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Passphrase</span>
          <input
            id="vault-passphrase"
            ref={passphraseInputRef}
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            minLength={MIN_PASSPHRASE_LENGTH}
            aria-describedby="vault-passphrase-help"
            autoComplete="new-password"
            required
          />
        </label>
        <p id="vault-passphrase-help" className="text-xs text-gray-500 dark:text-gray-400">
          Use at least {MIN_PASSPHRASE_LENGTH} characters. Short sentences or unique phrases are
          often easiest to recall.
        </p>

        <label className="block" htmlFor="vault-passphrase-confirm">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm passphrase
          </span>
          <input
            id="vault-passphrase-confirm"
            type={showPassphrase ? 'text' : 'password'}
            value={confirmPassphrase}
            onChange={e => setConfirmPassphrase(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="new-password"
            required
          />
        </label>

        <button
          type="button"
          onClick={() => setShowPassphrase(prev => !prev)}
          className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          {showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          disabled={isProcessing}
        >
          {isProcessing ? 'Securing...' : 'Create secure vault'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Clear fields
        </button>
      </div>
    </form>
  );

  const renderUnlock = () => (
    <form onSubmit={handleUnlock} className="space-y-6" aria-labelledby="vault-unlock-title">
      <div className="flex items-start justify-between">
        <div>
          <h2
            id="vault-unlock-title"
            className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Unlock secure vault
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your trusted passphrase to access encrypted pain entries and preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetVault}
          className="text-sm text-red-600 hover:text-red-500 focus:outline-none"
        >
          Reset vault
        </button>
      </div>

      <div className="space-y-4">
        <label className="block" htmlFor="vault-passphrase-unlock">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Passphrase</span>
          <input
            id="vault-passphrase-unlock"
            ref={passphraseInputRef}
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="button"
          onClick={() => setShowPassphrase(prev => !prev)}
          className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          {showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-100"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          disabled={isProcessing}
        >
          {isProcessing ? 'Unlocking...' : 'Unlock vault'}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setTimeout(() => passphraseInputRef.current?.focus(), 50);
          }}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </form>
  );

  const renderContent = () => {
    if (!status.sodiumReady) {
      return (
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Preparing secure vault…
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading privacy protections. Thank you for your patience.
          </p>
        </div>
      );
    }

    if (status.state === 'unlocked') {
      return <>{children}</>;
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 dark:bg-slate-100/80 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-dialog-title"
      >
        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                id="vault-dialog-title"
                className="text-3xl font-semibold text-gray-900 dark:text-gray-100"
              >
                Secure vault
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                End-to-end encrypted storage protects your story and wellbeing.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-lg font-semibold"
            >
              🔒
            </span>
          </div>
          <div>{status.state === 'uninitialized' ? renderSetup() : renderUnlock()}</div>
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Tip: If you ever need to safely reset the vault, choose “Reset vault”. This keeps your
            account secure but removes local data from this device.
          </p>
        </div>
      </div>
    );
  };

  return <>{status.state === 'unlocked' ? children : renderContent()}</>;
};
