import React from 'react';
import * as Sentry from '@sentry/react';

export const SentryTest: React.FC = () => {
  const handleTestError = () => {
    try {
      // Throw an error that will be caught and sent to Sentry
      throw new Error('Testing Sentry Error Tracking!');
    } catch (error) {
      // Explicitly capture the error
      Sentry.captureException(error);
      // Also send a test message
      Sentry.captureMessage('Test message from Pain Tracker app');
      // Re-throw to trigger the error boundary
      throw error;
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={handleTestError}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow"
      >
        Test Sentry Error
      </button>
    </div>
  );
};
