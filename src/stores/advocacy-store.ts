import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AdvocacyCard } from '../types/advocacy';
import { DEFAULT_ADVOCACY_CARDS } from '../types/advocacy';
import { createEncryptedOfflinePersistStorage } from './encrypted-idb-persist';

interface AdvocacyState {
    cards: AdvocacyCard[];
    activeCardId: string | null;

    // Actions
    addCard: (card: Omit<AdvocacyCard, 'id'>) => void;
    updateCard: (id: string, updates: Partial<AdvocacyCard>) => void;
    deleteCard: (id: string) => void;
    setActiveCard: (id: string | null) => void;
    resetDefaults: () => void;
}

const encryptedStorage: PersistStorage<AdvocacyState> = 
  createEncryptedOfflinePersistStorage<AdvocacyState>('advocacy-cards-storage');

export const useAdvocacyStore = create<AdvocacyState>()(
    persist(
        immer((set) => ({
            cards: DEFAULT_ADVOCACY_CARDS,
            activeCardId: null,

            addCard: (cardData) => set((state) => {
                const newCard: AdvocacyCard = {
                    ...cardData,
                    id: crypto.randomUUID(),
                };
                state.cards.push(newCard);
            }),

            updateCard: (id, updates) => set((state) => {
               const index = state.cards.findIndex(c => c.id === id);
               if (index !== -1) {
                   state.cards[index] = { ...state.cards[index], ...updates };
               }
            }),

            deleteCard: (id) => set((state) => {
                state.cards = state.cards.filter(c => c.id !== id);
            }),

            setActiveCard: (id) => set((state) => {
                state.activeCardId = id;
            }),

            resetDefaults: () => set((state) => {
                state.cards = DEFAULT_ADVOCACY_CARDS;
            })
        })),
        {
            name: 'advocacy-store',
            storage: encryptedStorage,
            skipHydration: false
        }
    )
);
