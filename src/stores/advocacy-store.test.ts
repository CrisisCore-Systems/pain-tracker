import { describe, it, expect, beforeEach } from 'vitest';
import { useAdvocacyStore } from './advocacy-store';
import { DEFAULT_ADVOCACY_CARDS } from '../types/advocacy';

// Mock crypto.randomUUID
global.crypto.randomUUID = (() => `12345678-1234-1234-1234-${Math.random().toString(16).substr(2, 12)}`) as any;

describe('Advocacy Store', () => {
    beforeEach(() => {
        useAdvocacyStore.persist.clearStorage();
        useAdvocacyStore.setState({
            cards: DEFAULT_ADVOCACY_CARDS,
            activeCardId: null
        });
    });

    it('initializes with default cards', () => {
        const state = useAdvocacyStore.getState();
        expect(state.cards).toHaveLength(DEFAULT_ADVOCACY_CARDS.length);
        expect(state.cards[0].id).toBe('chronic-pain');
    });

    it('adds a new card', () => {
        useAdvocacyStore.getState().addCard({
            title: 'Custom Alert',
            description: 'Testing',
            colorTheme: 'default'
        });

        const state = useAdvocacyStore.getState();
        expect(state.cards).toHaveLength(DEFAULT_ADVOCACY_CARDS.length + 1);
        expect(state.cards[state.cards.length - 1].title).toBe('Custom Alert');
    });

    it('updates a card', () => {
        const id = 'chronic-pain';
        useAdvocacyStore.getState().updateCard(id, {
            description: 'New Description'
        });

        const card = useAdvocacyStore.getState().cards.find(c => c.id === id);
        expect(card?.description).toBe('New Description');
    });

    it('deletes a card', () => {
        const id = 'chronic-pain';
        useAdvocacyStore.getState().deleteCard(id);

        const card = useAdvocacyStore.getState().cards.find(c => c.id === id);
        expect(card).toBeUndefined();
    });

    it('sets active card', () => {
        useAdvocacyStore.getState().setActiveCard('test-id');
        expect(useAdvocacyStore.getState().activeCardId).toBe('test-id');
    });
});
