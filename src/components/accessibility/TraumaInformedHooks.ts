/**
 * Trauma-Informed UX Hooks
 */

import { useContext, createContext } from 'react';
import { 
  TraumaInformedContextType, 
  defaultPreferences
} from './TraumaInformedTypes';

// Context for trauma-informed preferences
export const TraumaInformedContext = createContext<TraumaInformedContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
});

export const useTraumaInformed = () => useContext(TraumaInformedContext);
