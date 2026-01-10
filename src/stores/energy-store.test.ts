import { beforeEach, describe, expect, it } from 'vitest';
import { useEnergyStore } from './energy-store';
import { format } from 'date-fns';

describe('Energy Store (Spoon Tracker)', () => {
  beforeEach(() => {
     // useEnergyStore.persist.clearStorage(); works if supported by the middleware, 
     // but manually resetting state is safer for unit tests
     useEnergyStore.setState({ 
        history: {}, 
        settings: {
          defaultDailyCapacity: 12,
          enableAlerts: true,  
          alertThreshold: 0.8,
          autoResetTime: '04:00'
        } 
      });
  });

  it('initializes with default settings', () => {
    const state = useEnergyStore.getState();
    expect(state.settings.defaultDailyCapacity).toBe(12);
    expect(Object.keys(state.history).length).toBe(0);
  });

  it('can set daily capacity overridden for a specific day', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    useEnergyStore.getState().setDailyCapacity(today, 15);
    
    const budget = useEnergyStore.getState().getBudgetForDate(today);
    expect(budget.capacity).toBe(15);
  });

  it('can log a transaction (spoon usage)', () => {
     const today = format(new Date(), 'yyyy-MM-dd');
     
     useEnergyStore.getState().logTransaction({
         activityName: 'Grocery Shopping',
         cost: 3,
         category: 'physical'
     });

     const budget = useEnergyStore.getState().getBudgetForDate(today);
     expect(budget.transactions).toHaveLength(1);
     expect(budget.transactions[0].activityName).toBe('Grocery Shopping');
     expect(budget.transactions[0].cost).toBe(3);
     expect(budget.transactions[0].id).toBeDefined();
  });

  it('can delete a transaction', () => {
     const today = format(new Date(), 'yyyy-MM-dd');
     useEnergyStore.getState().logTransaction({
         activityName: 'Mistake',
         cost: 5,
         category: 'physical'
     });
     
     const budget = useEnergyStore.getState().getBudgetForDate(today);
     const txnId = budget.transactions[0].id;
     
     useEnergyStore.getState().deleteTransaction(txnId, today);
     
     const updatedBudget = useEnergyStore.getState().getBudgetForDate(today);
     expect(updatedBudget.transactions).toHaveLength(0);
  });
});
